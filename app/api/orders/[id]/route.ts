import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { orderStateTransitions } from "@/lib/order-state";
import { serializeOrder } from "@/lib/orders";
import { orderEditSchema, orderStateSchema } from "@/lib/validations/order";

type Context = { params: Promise<{ id: string }> };

function handleError(error: unknown) {
  if (error instanceof SyntaxError) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Order not found or changed. Refresh and try again." }, { status: 409 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ message: "This order number already exists." }, { status: 409 });
    }
  }
  return NextResponse.json({ message: "Unable to save changes. Please try again." }, { status: 500 });
}

function refreshOrders() {
  revalidatePath("/orders");
  revalidatePath("/sales");
  revalidatePath("/dashboard");
}

export async function PUT(request: Request, { params }: Context) {
  if (!(await auth())?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const parsed = orderEditSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
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
  if (!(await auth())?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const parsed = orderStateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ message: "Invalid order state" }, { status: 400 });
    const { status, previousStatus } = parsed.data;
    if (!orderStateTransitions[previousStatus].includes(status)) {
      return NextResponse.json({ message: "This state change is not allowed." }, { status: 400 });
    }
    const order = await prisma.order.update({
      where: { id, status: previousStatus },
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
  if (!(await auth())?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    refreshOrders();
    return NextResponse.json({ message: "Order deleted" });
  } catch (error) {
    return handleError(error);
  }
}
