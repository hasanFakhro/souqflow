import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { profileSchema } from "@/lib/validations/profile";

export async function PUT(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const parsed = profileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid data",
                },
                { status: 400 }
            );
        }

        const {
            name,
            email,
            phone,
            image,
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
            image: image || null,
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

        return NextResponse.json(
            {
                message: "Profile updated successfully",
                user: updatedUser,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Profile update error:", error);

        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}