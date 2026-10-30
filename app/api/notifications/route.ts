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

  const [notifications, unreadCount] =
    await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
          isRead: false,
          type: "LOW_STOCK",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
      }),

      prisma.notification.count({
        where: {
          userId,
          isRead: false,
          type: "LOW_STOCK",
        },
      }),
    ]);

  return NextResponse.json({
    notifications,
    unreadCount,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const userId = session.user.id as string;

  const { notificationId } = await request.json();

  if (!notificationId) {
    return NextResponse.json(
      { error: "Notification ID is required" },
      { status: 400 },
    );
  }

  const result = await prisma.$transaction(
    async (tx) => {
      
      const notification =
        await tx.notification.findFirst({
          where: {
            id: notificationId,
            userId,
            isRead: false,
          },
        });

      if (!notification) {
        return null;
      }

      await tx.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      await tx.notification.delete({
        where: {
          id: notification.id,
        },
      });

      return notification;
    },
  );

  if (!result) {
    return NextResponse.json(
      { error: "Notification not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    message: "Notification marked as read",
  });
}