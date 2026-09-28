import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

function formatCategoryName(name: string) {
  const trimmedName = name.trim();
  return trimmedName ? trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1) : "";
}

export async function PUT(request: NextRequest, { params }: Context) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const name = formatCategoryName(body.name || "");

    if (!name) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    const existingCategory = await prisma.category.findFirst({
      where: { id, ownerId: userId },
    });

    if (!existingCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    const duplicateCategory = await prisma.category.findFirst({
      where: {
        ownerId: userId,
        name: { equals: name, mode: "insensitive" },
        NOT: { id },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json({ message: "Category already exists" }, { status: 409 });
    }

    const category = await prisma.category.update({ where: { id }, data: { name } });
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
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
    const category = await prisma.category.findFirst({
      where: { id, ownerId: userId },
    });

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  }
}
