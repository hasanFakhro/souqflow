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
        where: { isHidden: false },
        include: { category: true },
        orderBy: [{ isPopular: "desc" }, { createdAt: "desc" }],
      },
      categories: true,
    },
  });

  if (!seller) {
    notFound();
  }

  return (
    <CatalogClient
      sellerId={seller.id}
      businessName={seller.business?.name ?? seller.name ?? "SouqFlow catalog"}
      description={seller.business?.description ?? undefined}
      categories={seller.categories.map((category) => ({
        id: category.id,
        name: category.name,
      }))}
      products={seller.products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.sellPrice,
        imageUrl: product.imageUrl,
        category: product.category
          ? { id: product.category.id, name: product.category.name }
          : null,
        stock: product.quantity,
        isPopular: product.isPopular,
      }))}
    />
  );
}
