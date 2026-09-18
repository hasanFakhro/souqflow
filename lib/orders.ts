import type { Prisma } from "@prisma/client";

export type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;
export type SerializedOrder = Omit<OrderWithItems, "orderedAt" | "createdAt" | "updatedAt" | "items"> & {
  orderedAt: string;
  items: Omit<OrderWithItems["items"][number], "createdAt">[];
};

export function serializeOrder(order: OrderWithItems): SerializedOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    status: order.status,
    orderedAt: order.orderedAt.toISOString(),
    items: order.items.map(({ id, orderId, productId, productName, category, quantity, unitCost, unitPrice }) => ({
      id, orderId, productId, productName, category, quantity, unitCost, unitPrice,
    })),
  };
}
