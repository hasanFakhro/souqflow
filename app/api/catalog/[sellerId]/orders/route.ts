import { customerSchema } from "@/lib/validations/customer";
import { getCatalogSellerId } from "@/lib/catalog";
import { randomUUID } from "crypto";

import prisma from "@/lib/prisma";
import type { CartItem } from "@/stores/cartStore";
import { OrderSource } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

function refreshOrderViews() {
  revalidatePath("/orders");
  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/catalog/[sellerId]", "page");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  const { sellerId: segment } = await params;
  const sellerId = getCatalogSellerId(segment);

  if (!sellerId) {
    return NextResponse.json({ error: "Invalid store link" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const items = body?.items;
    const customer = customerSchema.safeParse(body);
    if (!customer.success) {
      return NextResponse.json({ error: customer.error.issues[0].message }, { status: 400 });
    }
    const { customerName, customerAddress, customerPhone } = customer.data;

    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const requestedQuantities = new Map<string, number>();

    for (const item of items as CartItem[]) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 || item.quantity > 10000
      ) {
        return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
      }

      requestedQuantities.set(
        item.productId,
        (requestedQuantities.get(item.productId) ?? 0) + item.quantity
      );
    }

    const productIds = [...requestedQuantities.keys()];

    await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          ownerId: sellerId,
          isHidden: false,
        },
        include: { category: { select: { name: true } } },
      });

      if (products.length !== productIds.length) {
        throw new Error("One or more cart products are unavailable");
      }

      const productById = new Map(products.map((product) => [product.id, product]));
      const orderItems = productIds.map((productId) => {
        const product = productById.get(productId);

        if (!product) {
          throw new Error("One or more cart products are unavailable");
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
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );

      const order = await tx.order.create({
        data: {
          ownerId: sellerId,
          orderNumber: `ORD-${Date.now()}-${randomUUID().slice(0, 8)}`,
          total,
          customerName,
          customerAddress,
          customerPhone,
          source: OrderSource.STOREFRONT,
          items: { create: orderItems },
        },
      });

      await tx.notificationHistory.create({
  data: {
    userId: sellerId,
    type: "ORDER",
    message: customerName
      ? `New order ${order.orderNumber} from ${customerName}.`
      : `New order ${order.orderNumber} received.`,
  },
});

 await tx.notification.create({
  data: {
    userId: sellerId,
    type: "ORDER",
    message: customerName
      ? `New order ${order.orderNumber} from ${customerName}.`
      : `New order ${order.orderNumber} received.`,
  },
});

      return order;
    });

    refreshOrderViews();
    return NextResponse.json(
      { message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Not enough stock")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (
      error instanceof Error &&
      error.message === "One or more cart products are unavailable"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: "Order creation failed. Please try again." },
      { status: 500 }
    );
  }
}
