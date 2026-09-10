import { productSchema } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products, {status: 200});
  } catch (error) {
    console.error("Error fetching products:", error);

    return NextResponse.json(
      {message:'Failed to fetch products'},
      {status: 500}
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }
    const { name, description, imageUrl, sku, category, costPrice, sellPrice, quantity, lowStockAt } = parsed.data;

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
        description: description || null,
        imageUrl: imageUrl || null,
        sku: sku || null,
        category: category || null,

        costPrice: Number(costPrice),
        sellPrice: Number(sellPrice),
        quantity: Number(quantity),

        lowStockAt:
        lowStockAt !== undefined ? Number(lowStockAt) : null,
    }
  });

  revalidatePath("/inventory");
  revalidatePath("/products", "layout");
  revalidatePath("/dashboard");
  return NextResponse.json(
      {
        message: "Product added successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "A product with this SKU already exists." }, { status: 409 });
    }
    console.error("Error creating product:", error);

    return NextResponse.json(
      {message:'Failed to create product'},
      {status: 500}
    );
  }
}