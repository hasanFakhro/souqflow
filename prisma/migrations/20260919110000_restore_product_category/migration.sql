-- Repair the products table after a schema drift introduced categoryId without
-- the existing nullable category field used by the application.
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category" TEXT;

CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products"("category");
