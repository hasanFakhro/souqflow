import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CatalogClient from "./CatalogClient";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { sellerId } = await params;

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
  sellerId={sellerId} 
  businessName={seller.business.name}
  description={seller.business.description ?? undefined}
  categories={seller.categories.map((c) => ({
    id: c.id,
    name: c.name,
  }))}
  products={seller.products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.sellPrice,
    costPrice: p.costPrice,
    imageUrl: p.imageUrl,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
        }
      : null,
    stock: p.quantity,
  }))}
/>
  );
}