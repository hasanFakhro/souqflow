import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatCategoryName(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "";
  }

  return trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);

    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = formatCategoryName(body.name || "");

    if (!name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    // Case-insensitive duplicate check
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);

    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}