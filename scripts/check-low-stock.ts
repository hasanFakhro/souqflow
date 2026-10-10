import prisma from "@/lib/prisma";
import { isLowStock } from "@/lib/stock";

export async function checkLowStock() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const products = await prisma.product.findMany({
    where: {
      OR: [{ quantity: { lte: 0 } }, { lowStockAt: { not: null } }],
      ownerId: {
        not: null,
      },
    },
    select: {
      name: true,
      quantity: true,
      lowStockAt: true,
      ownerId: true,
    },
  });

  console.log("Products found:", products);

  for (const product of products) {
    if (!isLowStock(product.quantity, product.lowStockAt)) continue;
    const message = `${product.name} is low in stock. Only ${product.quantity} left.`;

    const existingNotification =
      await prisma.notificationHistory.findFirst({
        where: {
          userId: product.ownerId!,
          type: "LOW_STOCK",
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
