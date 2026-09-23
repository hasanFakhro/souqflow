import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

function refreshProductViews() {
  revalidatePath("/inventory");
  revalidatePath("/products", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/sales");
}

async function getOwnedProduct(id: string, userId: string) {
  return prisma.product.findFirst({ where: { id, ownerId: userId } });
}

export async function PUT(request: NextRequest, { params }: Context) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existingProduct = await getOwnedProduct(id, userId);

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (image && !(image instanceof File)) {
      return NextResponse.json({ message: "Invalid image file" }, { status: 400 });
    }

    const productData = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || "",
      imageUrl: existingProduct.imageUrl || "",
      sku: (formData.get("sku") as string) || "",
      categoryId: (formData.get("categoryId") as string) || "",
      costPrice: Number(formData.get("costPrice")),
      sellPrice: Number(formData.get("sellPrice")),
      quantity: Number(formData.get("quantity")),
      lowStockAt:
        formData.get("lowStockAt") !== ""
          ? Number(formData.get("lowStockAt"))
          : undefined,
    };

    const parsed = productSchema.safeParse(productData);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    if (parsed.data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: parsed.data.categoryId, ownerId: userId },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json({ message: "Category not found" }, { status: 400 });
      }
    }

    let imageUrl = existingProduct.imageUrl;

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 });
      }

      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: "Image must be smaller than 5MB" }, { status: 400 });
      }

      const extension = image.type.split("/")[1];
      const fileName = `${randomUUID()}.${extension}`;
      const filePath = path.join(process.cwd(), "public", fileName);
      const buffer = Buffer.from(await image.arrayBuffer());

      await writeFile(filePath, buffer);
      imageUrl = `/${fileName}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        description: parsed.data.description || null,
        imageUrl,
        sku: parsed.data.sku || null,
        categoryId: parsed.data.categoryId || null,
        costPrice: parsed.data.costPrice,
        sellPrice: parsed.data.sellPrice,
        quantity: parsed.data.quantity,
        lowStockAt: parsed.data.lowStockAt ?? null,
      },
      include: { category: true },
    });

    refreshProductViews();
    return NextResponse.json({ message: "Product updated successfully", product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "A product with this SKU already exists in your inventory." },
        { status: 409 }
      );
    }

    console.error("Error updating product:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const amount = Number((await request.json()).amount);

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { message: "Restock amount must be a positive whole number" },
        { status: 400 }
      );
    }

    const existingProduct = await getOwnedProduct(id, userId);

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { quantity: { increment: amount } },
    });

    refreshProductViews();
    return NextResponse.json({ message: "Product restocked successfully", product });
  } catch (error) {
    console.error("Error restocking product:", error);
    return NextResponse.json({ message: "Failed to restock product" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existingProduct = await getOwnedProduct(id, userId);

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });
    refreshProductViews();

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
