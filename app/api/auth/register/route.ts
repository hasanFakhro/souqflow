import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { isValidPhoneNumber } from "libphonenumber-js";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { email, password, name, phone } = body;

        if (!email || !password || !phone) {
            return NextResponse.json(
                {
                    error: "Email, password and phone number are required",
                },
                { status: 400 }
            );
        }

        if (!email.includes("@")) {
            return NextResponse.json(
                {
                    error: "Please enter a valid email",
                },
                { status: 400 }
            );
        }

        if (!isValidPhoneNumber(phone)) {
            return NextResponse.json(
                {
                    error: "Please enter a valid phone number",
                },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    error: "User already exists",
                },
                { status: 400 }
            );
        }

        const existingPhone = await prisma.user.findUnique({
            where: {
                phone,
            },
        });

        if (existingPhone) {
            return NextResponse.json(
                {
                    error: "Phone number is already in use",
                },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                phone,
                role: Role.USER,

                subscription: {
                    create: {
                        isActive: false,
                    },
                },
            },

            include: {
                subscription: true,
            },
        });

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            {
                message: "User created successfully",
                user: userWithoutPassword,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Register error:", error);

        return NextResponse.json(
            {
                error: "Unable to create your account",
            },
            { status: 500 }
        );
    }
}