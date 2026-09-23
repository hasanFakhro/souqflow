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

    const { categoryId } = parsed.data;

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, ownerId: userId },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 400 }
        );
      }
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
