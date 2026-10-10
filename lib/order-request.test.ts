import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "@prisma/client";
import { acceptOrderRequest } from "./order-request";

function transaction({ exists = true, claimed = 1, stock = 1, unavailable = false } = {}) {
  const stockUpdates: unknown[] = [];
  const claims: unknown[] = [];
  const queries: unknown[] = [];
  const tx = {
    order: {
      findFirst: async (query: unknown) => {
        queries.push(query);
        return exists ? { updatedAt: new Date(0), items: [
          { productId: unavailable ? null : "product-1", productName: "Coffee", quantity: 2 },
          { productId: "product-1", productName: "Coffee", quantity: 3 },
        ] } : null;
      },
      updateMany: async (query: unknown) => { claims.push(query); return { count: claimed }; },
    },
    product: { updateMany: async (query: unknown) => { stockUpdates.push(query); return { count: stock }; } },
  } as unknown as Prisma.TransactionClient;
  return { tx, stockUpdates, claims, queries };
}

test("accepting requests deducts aggregated quantities once and checks available stock", async () => {
  const fixture = transaction();
  assert.equal(await acceptOrderRequest(fixture.tx, "order-1", "owner-1"), true);
  assert.deepEqual(fixture.stockUpdates, [{ where: { id: "product-1", ownerId: "owner-1", quantity: { gte: 5 } }, data: { quantity: { decrement: 5 } } }]);
  assert.deepEqual(fixture.claims, [{ where: { id: "order-1", ownerId: "owner-1", source: "STOREFRONT", updatedAt: new Date(0) }, data: { source: "MANUAL" } }]);
});

test("accepted, missing or concurrently changed requests do not deduct stock again", async () => {
  for (const options of [{ exists: false }, { claimed: 0 }]) {
    const fixture = transaction(options);
    assert.equal(await acceptOrderRequest(fixture.tx, "order-1", "owner-1"), false);
    assert.deepEqual(fixture.stockUpdates, []);
  }
});

test("insufficient stock aborts acceptance so the caller can roll back its transaction", async () => {
  const fixture = transaction({ stock: 0 });
  await assert.rejects(acceptOrderRequest(fixture.tx, "order-1", "owner-1"), /Not enough stock for Coffee/);
});

test("deleted products prevent acceptance before any inventory changes", async () => {
  const fixture = transaction({ unavailable: true });
  await assert.rejects(acceptOrderRequest(fixture.tx, "order-1", "owner-1"), /Product is unavailable/);
  assert.deepEqual(fixture.claims, []);
  assert.deepEqual(fixture.stockUpdates, []);
});
