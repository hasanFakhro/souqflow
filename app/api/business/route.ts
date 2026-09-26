import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";

import { NextResponse } from "next/server";

import fs from "fs/promises";

import path from "path";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const business = await prisma.business.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        name: true,
        logo: true,
        description: true,
        instagram: true,
        facebook: true,
        tiktok: true,
        user: {
          select: {
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      business,
    });
  } catch (error) {
    console.error("BUSINESS GET ERROR:", error);

    return NextResponse.json(
      { message: "Failed to get business profile" },
      { status: 500 },
    );
  }
}

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

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const instagram = formData.get("instagram") as string;
    const facebook = formData.get("facebook") as string;
    const tiktok = formData.get("tiktok") as string;

    const logo = formData.get("logo");

    if (!name) {
      return NextResponse.json(
        { message: "Business name is required" },
        { status: 400 },
      );
    }

    let logoPath: string | undefined;

    if (logo instanceof File && logo.size > 0) {
      const bytes = await logo.arrayBuffer();

      const buffer = Buffer.from(bytes);

      const extension = path.extname(logo.name);

      const fileName = `${userId}-${Date.now()}${extension}`;

      const uploadDirectory = path.join(
        process.cwd(),
        "public",
        "uploads",
        "businesses",
      );

      await fs.mkdir(uploadDirectory, { recursive: true });

      const filePath = path.join(uploadDirectory, fileName);

      await fs.writeFile(filePath, buffer);

      logoPath = `/uploads/businesses/${fileName}`;
    }

    const business = await prisma.business.upsert({
      where: {
        userId,
      },

      update: {
        name,
        description,
        instagram,
        facebook,
        tiktok,
        ...(logoPath && { logo: logoPath }),
      },

      create: {
        name,
        description,
        instagram,
        facebook,
        tiktok,
        logo: logoPath,
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