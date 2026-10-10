import type { Prisma } from "@prisma/client";

/** Claim and accept a request, deducting stock within the caller's transaction. */
export async function acceptOrderRequest(tx: Prisma.TransactionClient, id: string, ownerId: string) {
  const order = await tx.order.findFirst({
    where: { id, ownerId, source: "STOREFRONT" }, include: { items: true },
  });
  if (!order) return false;
  if (!order.items.length || order.items.some((item) => !item.productId)) {
    throw new Error("Product is unavailable. Review this request before accepting it.");
  }
  const accepted = await tx.order.updateMany({
    where: { id, ownerId, source: "STOREFRONT", updatedAt: order.updatedAt },
    data: { source: "MANUAL" },
  });
  if (!accepted.count) return false;
  const quantities = new Map<string, { quantity: number; name: string }>();
  for (const item of order.items) {
    const previous = quantities.get(item.productId!);
    quantities.set(item.productId!, { quantity: (previous?.quantity ?? 0) + item.quantity, name: item.productName });
  }
  for (const [productId, { quantity, name }] of [...quantities].sort(([a], [b]) => a.localeCompare(b))) {
    const updated = await tx.product.updateMany({
      where: { id: productId, ownerId, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });
    if (!updated.count) throw new Error(`Not enough stock for ${name}, or the product is unavailable.`);
  }
  return true;
}
