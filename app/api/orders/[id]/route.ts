import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { orderStateTransitions } from "@/lib/order-state";
import { serializeOrder } from "@/lib/orders";
import { orderEditSchema, orderRequestActionSchema, orderStateSchema } from "@/lib/validations/order";

type Context = { params: Promise<{ id: string }> };

function handleError(error: unknown) {
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

    const order = await prisma.order.update({
      where: { id },
      data: { ...parsed.data, customerName: parsed.data.customerName || null },
      include: { items: true },
    });

    refreshOrders();
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
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
      const result = requestAction.data.action === "accept"
        ? await prisma.order.updateMany({ where, data: { source: "MANUAL" } })
        : await prisma.order.deleteMany({ where });

      if (result.count === 0) {
        return NextResponse.json({ message: "Request is no longer available. Refresh and try again." }, { status: 409 });
      }

      refreshOrders();
      return NextResponse.json({ message: requestAction.data.action === "accept" ? "Request accepted" : "Request deleted" });
    }

    const parsed = orderStateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid order state" }, { status: 400 });
    }

    const { status, previousStatus } = parsed.data;
    const existingOrder = await getOwnedOrder(id, userId);

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (existingOrder.status !== previousStatus) {
      return NextResponse.json(
        { message: "Order changed. Refresh and try again." },
        { status: 409 }
      );
    }

    if (!orderStateTransitions[previousStatus].includes(status)) {
      return NextResponse.json({ message: "This state change is not allowed." }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    refreshOrders();
    return NextResponse.json({ order: serializeOrder(order) });
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
