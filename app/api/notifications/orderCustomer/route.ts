
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const userId = session.user.id as string;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
        type: "ORDER",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    }),

    prisma.notification.count({
      where: {
        userId,
        isRead: false,
        type: "ORDER",
      },
    }),
  ]);

  return NextResponse.json({
    notifications,
    unreadCount,
  });
}

