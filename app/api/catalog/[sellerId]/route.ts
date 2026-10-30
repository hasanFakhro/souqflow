import { NextResponse } from "next/server";
import { getCatalogSellerId } from "@/lib/catalog";
import prisma from "@/lib/prisma";

type Context = { params: Promise<{ sellerId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { sellerId: catalogPathSegment } = await params;
  const sellerId = getCatalogSellerId(catalogPathSegment);

  const user = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      name: true,
      business: { select: { name: true, logo: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Catalog not found" }, { status: 404 });
  }

  const products = await prisma.product.findMany({
    where: { ownerId: user.id, isHidden: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      sellPrice: true,
      quantity: true,
      category: { select: { name: true } },
    },
  });

  return NextResponse.json({
    catalog: {
      name: user.business?.name ?? user.name ?? "SouqFlow catalog",
      logo: user.business?.logo ?? null,
    },
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      sellPrice: product.sellPrice,
      category: product.category?.name ?? null,
      inStock: product.quantity > 0,
    })),
  });
}
