import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Context = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Catalog not found" }, { status: 404 });
  }

  const products = await prisma.product.findMany({
    where: { ownerId: user.id },
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
      name: user.name ?? "SouqFlow catalog",
      logo: user.image,
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
