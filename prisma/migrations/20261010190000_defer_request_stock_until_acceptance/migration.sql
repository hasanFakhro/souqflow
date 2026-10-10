-- Existing storefront requests deducted inventory when they were created.
-- Release those deductions once so these requests can follow the new policy:
-- inventory changes only when a request is accepted into MANUAL orders.
-- Apply as part of the rollout of the updated request handlers, before accepting
-- existing requests with the new code. Prisma records this migration once.
UPDATE "products" AS product
SET "quantity" = product."quantity" + pending."quantity"::integer
FROM (
  SELECT item."productId", orders."ownerId", SUM(item."quantity") AS "quantity"
  FROM "order_items" AS item
  JOIN "orders" AS orders ON orders."id" = item."orderId"
  WHERE orders."source" = 'STOREFRONT' AND item."productId" IS NOT NULL
  GROUP BY item."productId", orders."ownerId"
) AS pending
WHERE product."id" = pending."productId"
  AND product."ownerId" = pending."ownerId";
