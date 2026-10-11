import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { profileSchema } from "@/lib/validations/profile";
import { ImageUploadError, uploadImage } from "@/lib/blob-images";
import { validateImageFile } from "@/lib/image-file";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const multipart = request.headers.get("content-type")?.includes("multipart/form-data");
    const formData = multipart ? await request.formData() : null;
    const body = formData ? Object.fromEntries([...formData.entries()].filter(([key]) => key !== "imageFile")) : await request.json();
    const imageFile = formData?.get("imageFile");
    if (imageFile && !(imageFile instanceof File)) {
      return NextResponse.json({ message: "Invalid image file" }, { status: 400 });
    }
    if (imageFile instanceof File && imageFile.size > 0) {
      const validationError = validateImageFile(imageFile);
      if (validationError) {
        return NextResponse.json({ message: validationError }, { status: 400 });
      }
    }

    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      currentPassword,
      newPassword,
    } = parsed.data;

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: user.id,
        },
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email is already in use" },
        { status: 409 }
      );
    }

    const existingPhone = await prisma.user.findFirst({
      where: {
        phone,
        NOT: {
          id: user.id,
        },
      },
    });

    if (existingPhone) {
      return NextResponse.json(
        { message: "Phone is already in use" },
        { status: 409 }
      );
    }

    const updateData: {
      name: string;
      email: string;
      phone: string;
      image: string | null;
      password?: string;
    } = {
      name,
      email,
      phone,
      image: user.image,
    };

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Current password is required" },
          { status: 400 }
        );
      }

      const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!passwordMatches) {
        return NextResponse.json(
          { message: "Current password is incorrect" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(
        newPassword,
        10
      );

      updateData.password = hashedPassword;
    }

    if (imageFile instanceof File && imageFile.size > 0) {
      updateData.image = await uploadImage(imageFile, `profiles/${user.id}`);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
      },
    });

    revalidatePath("/settings");
    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    if (error instanceof ImageUploadError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}
