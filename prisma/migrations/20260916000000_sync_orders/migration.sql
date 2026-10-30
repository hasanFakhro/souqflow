DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'DELIVERING';

CREATE TABLE IF NOT EXISTS "orders" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "customerName" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'COMPLETED',
  "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "order_items" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "productName" TEXT NOT NULL,
  "category" TEXT,
  "quantity" INTEGER NOT NULL,
  "unitCost" DOUBLE PRECISION NOT NULL,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE INDEX IF NOT EXISTS "orders_orderedAt_status_idx" ON "orders"("orderedAt", "status");
CREATE INDEX IF NOT EXISTS "order_items_category_idx" ON "order_items"("category");
CREATE INDEX IF NOT EXISTS "order_items_orderId_idx" ON "order_items"("orderId");
