import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let exchangeRate = await prisma.exchangeRate.findFirst();

    if (!exchangeRate) {
      exchangeRate = await prisma.exchangeRate.create({
        data: {
          usdToLbp: 89500,
        },
      });
    }

    return NextResponse.json({
      usdToLbp: exchangeRate.usdToLbp,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not get exchange rate" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    

    const body = await request.json();

    const usdToLbp = Number(body.usdToLbp);

    if (!Number.isFinite(usdToLbp) || usdToLbp <= 0) {
      return NextResponse.json(
        { error: "Invalid exchange rate" },
        { status: 400 }
      );
    }

    const exchangeRate = await prisma.exchangeRate.findFirst();

    if (!exchangeRate) {
      const created = await prisma.exchangeRate.create({
        data: {
          usdToLbp,
        },
      });

      return NextResponse.json({
        usdToLbp: created.usdToLbp,
      });
    }

    const updated = await prisma.exchangeRate.update({
      where: {
        id: exchangeRate.id,
      },
      data: {
        usdToLbp,
      },
    });

    return NextResponse.json({
      usdToLbp: updated.usdToLbp,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not update exchange rate" },
      { status: 500 }
    );
  }
}