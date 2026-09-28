import prisma from "@/lib/prisma";

export async function cleanupNotifications() {
  const fourHoursAgo = new Date(
    Date.now() - 4 * 60 * 60 * 1000,
  );

  const result = await prisma.notification.deleteMany({
    where: {
      isRead: true,
      readAt: {
        lt: fourHoursAgo,
      },
    },
  });

  console.log(
    `Deleted ${result.count} old read notifications.`,
  );
}