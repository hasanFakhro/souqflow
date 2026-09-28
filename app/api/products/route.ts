import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function refreshProductViews() {
  revalidatePath("/inventory");
  revalidatePath("/products", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/sales");
}

function getSkuPart(value?: string | null) {
  if (!value?.trim()) {
    return "NA";
  }

  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  if (!cleaned) {
    return "NA";
  }

  return cleaned.slice(0, 2).padEnd(2, "X");
}

async function generateUniqueSku(
  ownerId: string,
  categoryName: string | null,
  color: string | null,
  size: string | null
) {
  const categoryCode = getSkuPart(categoryName);
  const colorCode = getSkuPart(color);
  const sizeCode = getSkuPart(size);

  const prefix = `${categoryCode}-${colorCode}-${sizeCode}`;

  for (let attempt = 0; attempt < 20; attempt++) {
    const number = Math.floor(1000 + Math.random() * 9000);

    const sku = `${prefix}-${number}`;

    const existingProduct = await prisma.product.findFirst({
      where: {
        ownerId,
        sku,
      },
      select: {
        id: true,
      },
    });

    if (!existingProduct) {
      return sku;
    }
  }

  throw new Error("Could not generate a unique SKU");
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (image && !(image instanceof File)) {
      return NextResponse.json(
        { message: "Invalid image file" },
        { status: 400 }
      );
    }

    const productData = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || "",
      imageUrl: "",
      sku: "",
      categoryId: (formData.get("categoryId") as string) || "",
      color: (formData.get("color") as string) || "",
      size: (formData.get("size") as string) || "",
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

    const { categoryId } = parsed.data;

    let categoryName: string | null = null;

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          ownerId: userId,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!category) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 400 }
        );
      }

      categoryName = category.name;
    }

    const color = parsed.data.color || null;
    const size = parsed.data.size || null;

    const generatedSku = await generateUniqueSku(
      userId,
      categoryName,
      color,
      size
    );

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

      const extension = image.type.split("/")[1];
      const fileName = `${randomUUID()}.${extension}`;
      const filePath = path.join(process.cwd(), "public", fileName);
      const buffer = Buffer.from(await image.arrayBuffer());

      await writeFile(filePath, buffer);
      imageUrl = `/${fileName}`;
    }

    const product = await prisma.product.create({
      data: {
        ownerId: userId,
        name: parsed.data.name.trim(),
        description: parsed.data.description || null,
        imageUrl,
        sku: generatedSku,
        categoryId: parsed.data.categoryId || null,
        color,
        size,
        costPrice: parsed.data.costPrice,
        sellPrice: parsed.data.sellPrice,
        quantity: parsed.data.quantity,
        lowStockAt: parsed.data.lowStockAt ?? null,
      },
      include: { category: true },
    });

    refreshProductViews();

    return NextResponse.json(
      { message: "Product added successfully", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}
