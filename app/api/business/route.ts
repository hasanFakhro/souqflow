
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const body = await request.json();

    const { name, phone, logo } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Business name is required" },
        { status: 400 },
      );
    }

    const business = await prisma.business.upsert({
      where: {
        userId,
      },
      update: {
        name,
        phone,
        logo,
      },
      create: {
        name,
        phone,
        logo,
        userId,
      },
    });

    return NextResponse.json(
      {
        message: "Business profile updated successfully",
        business,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("BUSINESS UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update business profile" },
      { status: 500 },
    );
  }
}

