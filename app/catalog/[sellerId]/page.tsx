import { notFound } from "next/navigation";
import { getCatalogSellerId } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import CatalogClient from "./CatalogClient";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { sellerId: catalogPathSegment } = await params;
  const sellerId = getCatalogSellerId(catalogPathSegment);

  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    include: {
      business: true,
      products: {
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
      categories: true,
    },
  });

  if (!seller || !seller.business) {
    notFound();
  }

  return (
    <CatalogClient
      sellerId={seller.id}
      businessName={seller.business.name}
      description={seller.business.description ?? undefined}
      categories={seller.categories.map((category) => ({
        id: category.id,
        name: category.name,
      }))}
      products={seller.products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.sellPrice,
        costPrice: product.costPrice,
        imageUrl: product.imageUrl,
        category: product.category
          ? { id: product.category.id, name: product.category.name }
          : null,
        stock: product.quantity,
      }))}
    />
  );
}
