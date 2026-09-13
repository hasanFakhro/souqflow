
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, name, phone } = body;

        if (!email || !password || !phone) {
            return NextResponse.json(
                { error: "Email, password and phone number are required" },
                { status: 400 }
            );
        }

        if (!email.includes("@")) {
            return NextResponse.json(
                { error: "Please enter a valid email" },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/\s/g, "");
        const phoneRegex = /^\+961\d{8}$/;

        if (!phoneRegex.test(cleanPhone)) {
            return NextResponse.json(
                { error: "Please enter a valid Lebanese phone number." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                phone: cleanPhone,
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
            { error: "Unable to create your account" },
            { status: 500 }
        );
    }
}

