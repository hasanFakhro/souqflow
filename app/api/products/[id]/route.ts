import { productSchema } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }
    const { name, description, imageUrl, sku, category, costPrice, sellPrice, quantity, lowStockAt } = parsed.data;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const product = await prisma.product.update({
      where: {
        id,
      },

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
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/products", "layout");
    revalidatePath("/dashboard");
    return NextResponse.json(
      {
        message: "Product updated successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "A product with this SKU already exists." }, { status: 409 });
    }
    console.error("Error updating product:", error);

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}



export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

     await prisma.product.delete({
      where: {
        id,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/products", "layout");
    revalidatePath("/dashboard");
    return NextResponse.json(
      {
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);

    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}