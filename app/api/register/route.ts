import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

type RegistrationInput = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
};

function readRegistrationInput(input: unknown) {
  const values =
    input !== null && typeof input === "object" && !Array.isArray(input)
      ? (input as RegistrationInput)
      : {};
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  const password = typeof values.password === "string" ? values.password : "";

  if (name.length < 2) {
    return { error: "Please enter a name with at least 2 characters." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  return { name, email, password };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = readRegistrationInput(body);

  if ("error" in input) {
    return NextResponse.json({ error: input.error }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const password = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password,
        subscription: { create: { isActive: false } },
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Unable to register user", error);
    return NextResponse.json(
      { error: "Unable to create your account. Please try again." },
      { status: 500 }
    );
  }
}
