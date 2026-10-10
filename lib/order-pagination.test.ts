import assert from "node:assert/strict";
import test from "node:test";
import { filterOrderIndex, orderPage, type OrderSearchEntry } from "./order-pagination";
import { orderRequestActionSchema } from "./validations/order";

const index: OrderSearchEntry[] = [
  { id: "manual", source: "MANUAL", status: "PENDING", searchText: "alice coffee" },
  { id: "request", source: "STOREFRONT", status: "PENDING", searchText: "alice coffee" },
  { id: "delivered-request", source: "STOREFRONT", status: "DONE", searchText: "bob tea" },
];

test("tabs separate orders by source independently of status", () => {
  assert.deepEqual(filterOrderIndex(index, "", "ALL", "MANUAL").map(order => order.id), ["manual"]);
  assert.deepEqual(filterOrderIndex(index, "", "ALL", "STOREFRONT").map(order => order.id), ["request", "delivered-request"]);
});

test("search, state and pagination operate within the selected source", () => {
  const matches = filterOrderIndex(index, " ALICE ", "PENDING", "STOREFRONT");
  assert.deepEqual(matches.map(order => order.id), ["request"]);
  assert.equal(filterOrderIndex(index, "alice", "DONE", "STOREFRONT").length, 0);
  assert.deepEqual(orderPage(matches.length, 3), { page: 1, totalPages: 1, offset: 0, size: 1, firstPageSize: 1 });
});

test("request decisions accept only explicit actions and reject extra mutations", () => {
  assert.equal(orderRequestActionSchema.safeParse({ action: "accept" }).success, true);
  assert.equal(orderRequestActionSchema.safeParse({ action: "reject" }).success, true);
  assert.equal(orderRequestActionSchema.safeParse({ action: "delete" }).success, false);
  assert.equal(orderRequestActionSchema.safeParse({ action: "accept", ownerId: "other" }).success, false);
});

test("phone search accepts punctuation and partial numbers while respecting tabs and state", () => {
  const entries: OrderSearchEntry[] = [
    { ...index[0], customerPhone: "+96170123456" },
    { ...index[1], customerPhone: "+96170123456" },
    { ...index[2], customerPhone: null },
  ];
  assert.deepEqual(filterOrderIndex(entries, "+961 (70) 123-456", "ALL", "MANUAL").map((order) => order.id), ["manual"]);
  assert.deepEqual(filterOrderIndex(entries, "70 123", "PENDING", "STOREFRONT").map((order) => order.id), ["request"]);
  assert.equal(filterOrderIndex(entries, "70123", "DONE", "STOREFRONT").length, 0);
  assert.equal(filterOrderIndex(entries, "999999", "ALL", "MANUAL").length, 0);
});
