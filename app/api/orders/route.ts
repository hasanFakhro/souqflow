import { randomUUID } from "crypto";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeOrder } from "@/lib/orders";

import type { CartItem } from "@/stores/cartStore";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

function refreshOrderViews() {
  revalidatePath("/orders");
  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/inventory");
}

export async function GET(request: NextRequest) {
  if (!(await auth())?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const ids = [...new Set(request.nextUrl.searchParams.getAll("id"))];

  if (
    !ids.length ||
    ids.length > 10 ||
    ids.some((id) => !id || id.length > 100)
  ) {
    return NextResponse.json(
      { message: "Request between 1 and 10 order IDs." },
      { status: 400 },
    );
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (orders.length !== ids.length) {
      return NextResponse.json(
        {
          message: "An order was removed. Refresh the orders list.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        orders: orders.map(serializeOrder),
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to load orders. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const items = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 },
      );
    }
    const customerName = typeof body?.customerName === "string" ? body.customerName.trim() : "";
    const customerAddress = typeof body?.customerAddress === "string" ? body.customerAddress.trim() : "";
    const customerPhone = typeof body?.customerPhone === "string" ? body.customerPhone.trim() : "";

    if (!customerName || !customerAddress || !/^\+?[0-9\s-]{7,15}$/.test(customerPhone)) {
      return NextResponse.json(
        { error: "Invalid customer details" },
        { status: 400 }
      );
    }

    const requestedQuantities = new Map<string, number>();

    for (const item of items as CartItem[]) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          { error: "Invalid cart item" },
          { status: 400 },
        );
      }

      requestedQuantities.set(
        item.productId,
        (requestedQuantities.get(item.productId) ?? 0) +
          item.quantity,
      );
    }

    const productIds = [...requestedQuantities.keys()];

    await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
          ownerId: userId,
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      if (products.length !== productIds.length) {
        throw new Error(
          "One or more cart products are unavailable",
        );
      }

      const productById = new Map(
        products.map((product) => [product.id, product]),
      );

      const orderItems = productIds.map((productId) => {
        const product = productById.get(productId);

        if (!product) {
          throw new Error(
            "One or more cart products are unavailable",
          );
        }

        return {
          productId: product.id,
          productName: product.name,
          category: product.category?.name ?? null,
          unitPrice: product.sellPrice,
          unitCost: product.costPrice,
          quantity: requestedQuantities.get(product.id) ?? 0,
        };
      });

      const total = orderItems.reduce(
        (sum, item) =>
          sum + item.unitPrice * item.quantity,
        0,
      );

      const order = await tx.order.create({
        data: {
          ownerId: userId,
          orderNumber: `ORD-${Date.now()}-${randomUUID().slice(
            0,
            8,
          )}`,
          total,
          customerName,
          customerAddress,
          customerPhone,
          items: {
            create: orderItems,
          },
        },
      });

      for (const item of orderItems) {
        const product = productById.get(item.productId);

        if (!product) {
          throw new Error(
            "One or more cart products are unavailable",
          );
        }

        const newQuantity =
          product.quantity - item.quantity;

        if (newQuantity < 0) {
          throw new Error(
            `Not enough stock for ${item.productName}`,
          );
        }

        await tx.product.update({
          where: {
            id: product.id,
          },
          data: {
            quantity: newQuantity,
          },
        });

        if (product.quantity > 5 && newQuantity <= 5) {
          const message = `${product.name} is low in stock. Only ${newQuantity} left.`;

          await tx.notification.create({
            data: {
              userId,
              message,
              type: "LOW_STOCK",
            },
          });

          await tx.notificationHistory.create({
            data: {
              userId,
              type: "LOW_STOCK",
              message,
            },
          });

        }
      }

      return order;
    });

    refreshOrderViews();

    return NextResponse.json(
      { message: "Order created successfully" },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Not enough stock")
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "One or more cart products are unavailable"
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    console.error("Order creation failed:", error);

    return NextResponse.json(
      {
        error:
          "Order creation failed. Please try again.",
      },
      { status: 500 },
    );
  }
}