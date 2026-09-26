import cron from "node-cron";
import prisma from "@/lib/prisma";
import { checkLowStock } from "./check-low-stock";
import { cleanupNotifications } from "./cleanup-notifications";

// Check low stock every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running low-stock check...");

  try {
    await checkLowStock();
  } catch (error) {
    console.error("Low-stock check failed:", error);
  }
});

// Clean up old notifications every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running notification cleanup...");

  try {
    await cleanupNotifications();
  } catch (error) {
    console.error("Notification cleanup failed:", error);
  }
});

console.log("Notification scheduler started.");

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});