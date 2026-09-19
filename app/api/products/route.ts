import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { productSchema } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
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

    let imageUrl: string | null = null;

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
      imageUrl: imageUrl || "",
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
      categoryId: parsedCategoryId,
      costPrice: parsedCostPrice,
      sellPrice: parsedSellPrice,
      quantity: parsedQuantity,
      lowStockAt: parsedLowStockAt,
    } = parsed.data;

    const product = await prisma.product.create({
      data: {
        name: parsedName.trim(),
        description: parsedDescription || null,
        imageUrl,
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
        message: "Product added successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);

    return NextResponse.json(
      {
        message: "Failed to create product",
      },
      { status: 500 }
    );
  }
}