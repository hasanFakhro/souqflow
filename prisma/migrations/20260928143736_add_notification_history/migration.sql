-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LOW_STOCK', 'ORDER', 'SUBSCRIPTION');

-- CreateTable
CREATE TABLE "notification_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_history_userId_createdAt_idx" ON "notification_history"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "notification_history" ADD CONSTRAINT "notification_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
