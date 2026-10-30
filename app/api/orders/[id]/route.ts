import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { planOrderItems } from "@/lib/order-edit";
import { acceptOrderRequest } from "@/lib/order-request";
import { serializeOrder } from "@/lib/orders";
import { orderEditSchema, orderRequestActionSchema, orderStateSchema, paymentStateSchema } from "@/lib/validations/order";

type Context = { params: Promise<{ id: string }> };

function handleError(error: unknown) {
  if (error instanceof Error && /^(Not enough stock|Product is unavailable)/.test(error.message)) {
    return NextResponse.json({ message: error.message }, { status: 409 });
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json({ message: "This order number already exists." }, { status: 409 });
  }
  console.error("Unable to save order:", error);
  return NextResponse.json({ message: "Unable to save changes. Please try again." }, { status: 500 });
}

function refreshOrders() {
  revalidatePath("/orders");
  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/inventory");
  revalidatePath("/catalog/[sellerId]", "page");
}

async function getOwnedOrder(id: string, userId: string) {
  return prisma.order.findFirst({
    where: { id, ownerId: userId },
    include: { items: true },
  });
}

export async function PUT(request: Request, { params }: Context) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const parsed = orderEditSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    const existingOrder = await getOwnedOrder(id, userId);

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const { items, ...details } = parsed.data;
    const order = await prisma.$transaction(async (tx) => {
      // Claim this version before adjusting stock so concurrent edits cannot apply twice.
      const claimed = await tx.order.updateMany({
        where: { id, ownerId: userId, updatedAt: existingOrder.updatedAt },
        data: { ...details, customerName: details.customerName || null,
          ...(details.customerPhone !== undefined && { customerPhone: details.customerPhone || null }),
          ...(details.customerAddress !== undefined && { customerAddress: details.customerAddress || null }) },
      });
      if (!claimed.count) throw new Error("Order changed. Refresh and try again.");
      if (items) {
        const products = await tx.product.findMany({
          where: { ownerId: userId, id: { in: items.flatMap((item) => item.productId ? [item.productId] : []) } },
          include: { category: true },
        });
        const { replacements, deltas, total } = planOrderItems(existingOrder.items, items, products);
        // Pending requests never reserve or return inventory.
        for (const [productId, delta] of existingOrder.source === "MANUAL" ? deltas : []) {
          if (!delta) continue;
          const result = await tx.product.updateMany({
            where: { id: productId, ownerId: userId, ...(delta > 0 && { quantity: { gte: delta } }) },
            data: { quantity: { decrement: delta } },
          });
          if (!result.count) throw new Error("Not enough stock or product is unavailable. Refresh and try again.");
        }
        await tx.orderItem.deleteMany({ where: { orderId: id } });
        await tx.order.update({ where: { id }, data: {
          total,
          items: { create: replacements },
        } });
      }
      return tx.order.findUniqueOrThrow({ where: { id }, include: { items: { orderBy: { createdAt: "asc" } } } });
    });

    refreshOrders();
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    if (error instanceof Error && /^(Order changed|Invalid order item|Product is unavailable|Not enough stock)/.test(error.message)) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const requestAction = orderRequestActionSchema.safeParse(body);

    if (requestAction.success) {
      // Source and ownership are checked atomically so a stale request cannot
      // reject an order that has already been accepted.
      const where = { id, ownerId: userId, source: "STOREFRONT" as const };
      const count = requestAction.data.action === "accept"
        ? Number(await prisma.$transaction((tx) => acceptOrderRequest(tx, id, userId)))
        : (await prisma.order.deleteMany({ where })).count;

      if (count === 0) {
        return NextResponse.json({ message: "Request is no longer available. Refresh and try again." }, { status: 409 });
      }

      refreshOrders();
      return NextResponse.json({ message: requestAction.data.action === "accept" ? "Request accepted" : "Request deleted" });
    }

    const payment = paymentStateSchema.safeParse(body);
    if (payment.success) {
      const result = await prisma.order.updateMany({
        where: { id, ownerId: userId, paymentStatus: payment.data.previousPaymentStatus },
        data: { paymentStatus: payment.data.paymentStatus },
      });
      if (!result.count) {
        return NextResponse.json({ message: "Order changed or is unavailable. Refresh and try again." }, { status: 409 });
      }
      refreshOrders();
      return NextResponse.json({ message: "Payment state updated" });
    }

    const parsed = orderStateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid order state" }, { status: 400 });
    }

    const { status, previousStatus } = parsed.data;
    const updated = await prisma.order.updateMany({
      where: { id, ownerId: userId, status: previousStatus },
      data: { status },
    });
    if (!updated.count) {
      return NextResponse.json(
        { message: "Order changed. Refresh and try again." },
        { status: 409 }
      );
    }

    const order = await getOwnedOrder(id, userId);

    refreshOrders();
    return NextResponse.json({ order: order ? serializeOrder(order) : null });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existingOrder = await getOwnedOrder(id, userId);

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    await prisma.order.delete({ where: { id } });
    refreshOrders();

    return NextResponse.json({ message: "Order deleted" });
  } catch (error) {
    return handleError(error);
  }
}
