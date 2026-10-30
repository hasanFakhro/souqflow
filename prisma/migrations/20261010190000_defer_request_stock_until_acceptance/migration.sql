-- Existing storefront requests deducted inventory when they were created.
-- Release those deductions once so these requests can follow the new policy:
-- inventory changes only when a request is accepted into MANUAL orders.
-- The updated production deployment went live at 2026-10-10T16:23:33Z.
-- Requests created after that cutover never deducted stock and must be excluded.
-- Prisma records this migration once. Serialize request mutations while restoring
-- legacy deductions, so acceptance cannot race with this reconciliation.
BEGIN;
LOCK TABLE "orders" IN SHARE ROW EXCLUSIVE MODE;
UPDATE "products" AS product
SET "quantity" = product."quantity" + pending."quantity"::integer
FROM (
  SELECT item."productId", orders."ownerId", SUM(item."quantity") AS "quantity"
  FROM "order_items" AS item
  JOIN "orders" AS orders ON orders."id" = item."orderId"
  WHERE orders."source" = 'STOREFRONT' AND item."productId" IS NOT NULL
    AND orders."createdAt" < TIMESTAMP '2026-10-10 16:23:33'
  GROUP BY item."productId", orders."ownerId"
) AS pending
WHERE product."id" = pending."productId"
  AND product."ownerId" = pending."ownerId";
COMMIT;
