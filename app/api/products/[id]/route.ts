import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const sku = formData.get("sku") as string;
    const categoryId = formData.get("categoryId") as string;
    const costPrice = formData.get("costPrice") as string;
    const sellPrice = formData.get("sellPrice") as string;
    const quantity = formData.get("quantity") as string;
    const lowStockAt = formData.get("lowStockAt") as string;

    const image = formData.get("image");

    if (image && !(image instanceof File)) {
      return NextResponse.json(
        { message: "Invalid image file" },
        { status: 400 }
      );
    }

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

    let imageUrl = existingProduct.imageUrl;

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Only image files are allowed" },
          { status: 400 }
        );
      }

      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: "Image must be smaller than 5MB" },
          { status: 400 }
        );
      }

      const uploadDir = path.join(process.cwd(), "public");

      const extension = image.type.split("/")[1];
      const fileName = `${randomUUID()}.${extension}`;

      const filePath = path.join(uploadDir, fileName);

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await writeFile(filePath, buffer);

      imageUrl = `/${fileName}`;
    }

    const productData = {
      name,
      description: description || "",
      imageUrl,
      sku: sku || "",
      categoryId: categoryId || "",
      costPrice: Number(costPrice),
      sellPrice: Number(sellPrice),
      quantity: Number(quantity),
      lowStockAt:
        lowStockAt !== "" ? Number(lowStockAt) : undefined,
    };

    const parsed = productSchema.safeParse(productData);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const {
      name: parsedName,
      description: parsedDescription,
      sku: parsedSku,
      categoryId: parsedCategoryId,
      costPrice: parsedCostPrice,
      sellPrice: parsedSellPrice,
      quantity: parsedQuantity,
      lowStockAt: parsedLowStockAt,
    } = parsed.data;

    const product = await prisma.product.update({
      where: {
        id,
      },

      data: {
        name: parsedName.trim(),
        description: parsedDescription || null,
        imageUrl,
        sku: parsedSku || null,
        categoryId: parsedCategoryId || null,

        costPrice: Number(parsedCostPrice),
        sellPrice: Number(parsedSellPrice),
        quantity: Number(parsedQuantity),

        lowStockAt:
          parsedLowStockAt !== undefined
            ? Number(parsedLowStockAt)
            : null,
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
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "A product with this SKU already exists.",
        },
        { status: 409 }
      );
    }

    console.error("Error updating product:", error);

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const amount = Number(body.amount);

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { message: "Restock amount must be a positive whole number" },
        { status: 400 }
      );
    }

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
        quantity: {
          increment: amount,
        },
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return NextResponse.json(
      {
        message: "Product restocked successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error restocking product:", error);

    return NextResponse.json(
      { message: "Failed to restock product" },
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