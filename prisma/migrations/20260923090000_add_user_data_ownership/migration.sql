-- LOCAL DATABASE ONLY.
-- This migration intentionally leaves legacy rows unassigned. The application
-- only queries records whose ownerId matches the authenticated user, so legacy
-- records are not exposed to any account. New records always receive an ownerId.

ALTER TABLE "products" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "orders" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "categories" ADD COLUMN "ownerId" TEXT;

DROP INDEX "products_sku_key";
DROP INDEX "categories_name_key";

CREATE UNIQUE INDEX "products_ownerId_sku_key" ON "products"("ownerId", "sku");
CREATE UNIQUE INDEX "categories_ownerId_name_key" ON "categories"("ownerId", "name");
CREATE INDEX "products_ownerId_createdAt_idx" ON "products"("ownerId", "createdAt");
CREATE INDEX "orders_ownerId_orderedAt_idx" ON "orders"("ownerId", "orderedAt");
CREATE INDEX "categories_ownerId_name_idx" ON "categories"("ownerId", "name");

ALTER TABLE "products"
  ADD CONSTRAINT "products_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "categories"
  ADD CONSTRAINT "categories_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
