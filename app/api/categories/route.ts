import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function formatCategoryName(name: string) {
  const trimmedName = name.trim();
  return trimmedName ? trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1) : "";
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      where: { ownerId: userId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = formatCategoryName(body.name || "");

    if (!name) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        ownerId: userId,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existingCategory) {
      return NextResponse.json({ message: "Category already exists" }, { status: 409 });
    }

    const category = await prisma.category.create({ data: { ownerId: userId, name } });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ message: "Failed to create category" }, { status: 500 });
  }
}
