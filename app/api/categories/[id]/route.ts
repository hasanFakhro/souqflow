import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatCategoryName(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "";
  }

  return trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const name = formatCategoryName(body.name || "");

    if (!name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Case-insensitive duplicate check
    // Excludes the category currently being edited
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        NOT: {
          id,
        },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);

    return NextResponse.json(
      { message: "Failed to update category" },
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

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);

    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}