import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import type { orderItemEditSchema } from "./validations/order";
import type { OrderWithItems } from "./orders";

type Product = Pick<Prisma.ProductGetPayload<{ include: { category: true } }>, "id" | "name" | "category" | "costPrice">;

export function planOrderItems(old: OrderWithItems["items"], items: z.infer<typeof orderItemEditSchema>[], products: Product[]) {
  const oldItems = new Map(old.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const productById = new Map(products.map((product) => [product.id, product]));
  const replacements = items.map((item) => {
    const previous = item.id ? oldItems.get(item.id) : undefined;
    if (item.id && (!previous || seen.has(item.id) || previous.productId !== item.productId)) throw new Error("Invalid order item");
    if (item.id) seen.add(item.id);
    const product = item.productId ? productById.get(item.productId) : undefined;
    if (!previous && !product) throw new Error("Product is unavailable");
    return {
      id: item.id, productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice,
      productName: previous ? previous.productName : product!.name,
      category: previous ? previous.category : product!.category?.name ?? null,
      unitCost: previous ? previous.unitCost : product!.costPrice,
    };
  });
  const deltas = new Map<string, number>();
  for (const item of old) if (item.productId) deltas.set(item.productId, (deltas.get(item.productId) ?? 0) - item.quantity);
  for (const item of replacements) if (item.productId) deltas.set(item.productId, (deltas.get(item.productId) ?? 0) + item.quantity);
  return { replacements, deltas, total: replacements.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) };
}
