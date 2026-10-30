import { prisma } from "@/lib/prisma";
import { findAvailableSku } from "@/lib/product-sku";

export async function generateUniqueSku(
  ownerId: string,
  category: string | null,
  color: string | null,
  size: string | null,
  productId?: string,
  currentSku?: string | null,
) {
  const currentSuffix = currentSku?.match(/(?:^|-)(\d{4})$/)?.[1];
  for (let attempt = 0; attempt < 20; attempt++) {
    const suffix = attempt === 0 && currentSuffix
      ? currentSuffix
      : String(Math.floor(1000 + Math.random() * 9000));
    const sku = await findAvailableSku(category, color, size, suffix, async (candidate) => {
      const existing = await prisma.product.findFirst({
        where: { ownerId, sku: candidate, ...(productId ? { id: { not: productId } } : {}) },
        select: { id: true },
      });
      return Boolean(existing);
    });
    if (sku) return sku;
  }
  throw new Error("Could not generate a unique SKU");
}
