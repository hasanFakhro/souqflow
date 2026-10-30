-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('STOREFRONT', 'MANUAL');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'MANUAL';
