import prisma from "@/lib/prisma";

export async function checkLowStock() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const products = await prisma.product.findMany({
    where: {
      quantity: {
        lte: 5,
      },
      ownerId: {
        not: null,
      },
    },
    select: {
      name: true,
      quantity: true,
      ownerId: true,
    },
  });

  console.log("Products found:", products);

  for (const product of products) {
    const message = `${product.name} is low in stock. Only ${product.quantity} left.`;

    const existingNotification =
      await prisma.notification.findFirst({
        where: {
          userId: product.ownerId!,
          message: {
            startsWith: `${product.name} is low in stock.`,
          },
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

    if (existingNotification) {
      console.log(
        `Notification already exists for ${product.name}.`,
      );
      continue;
    }

    await prisma.$transaction([
      prisma.notification.create({
        data: {
          userId: product.ownerId!,
          message,
          type: "LOW_STOCK",
        },
      }),

      prisma.notificationHistory.create({
        data: {
          userId: product.ownerId!,
          type: "LOW_STOCK",
          message,
        },
      }),
    ]);

    console.log(
      `Notification created for ${product.name}.`,
    );
  }

  console.log("Low-stock check completed.");
}