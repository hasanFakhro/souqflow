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

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id as string;

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 },
      );
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        type: "ORDER",
        isRead: false,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Order notification not found" },
        { status: 404 },
      );
    }

    await prisma.notification.delete({
      where: {
        id: notification.id,
      },
    });

    return NextResponse.json({
      message: "Order notification marked as read",
    });
  } catch (error) {
    console.error(
      "Failed to mark order notification as read:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

