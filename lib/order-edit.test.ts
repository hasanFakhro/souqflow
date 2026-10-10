import assert from "node:assert/strict";
import test from "node:test";
import { planOrderItems } from "./order-edit";
import { orderEditSchema } from "./validations/order";
import type { OrderWithItems } from "./orders";

const old: OrderWithItems["items"] = [
  { id: "item-1", orderId: "order-1", productId: "product-1", productName: "Original name", category: null, quantity: 3, unitCost: 2, unitPrice: 5, createdAt: new Date() },
  { id: "item-2", orderId: "order-1", productId: "product-2", productName: "Removed product", category: "Tea", quantity: 2, unitCost: 1, unitPrice: 4, createdAt: new Date() },
];

test("quantity edits return removed stock and preserve historical product costs", () => {
  const result = planOrderItems(old, [{ id: "item-1", productId: "product-1", quantity: 5, unitPrice: 6 }], []);
  assert.equal(result.deltas.get("product-1"), 2);
  assert.equal(result.deltas.get("product-2"), -2);
  assert.equal(result.total, 30);
  assert.equal(result.replacements[0].unitCost, 2);
  assert.equal(result.replacements[0].productName, "Original name");
});

test("price-only edits do not change stock; deleted products remain editable", () => {
  const historical = [{ ...old[0], productId: null }];
  const result = planOrderItems(historical, [{ id: "item-1", productId: null, quantity: 3, unitPrice: 8 }], []);
  assert.equal(result.deltas.size, 0);
  assert.equal(result.total, 24);
  const unchanged = planOrderItems([old[0]], [{ id: "item-1", productId: "product-1", quantity: 3, unitPrice: 8 }], []);
  assert.equal(unchanged.deltas.get("product-1"), 0);
});

test("adding products uses their saved metadata and aggregates stock across lines", () => {
  const product = { id: "product-3", name: "New product", category: null, costPrice: 3 };
  const result = planOrderItems(old, [
    { id: "item-1", productId: "product-1", quantity: 1, unitPrice: 5 },
    { productId: "product-3", quantity: 2, unitPrice: 8 },
    { productId: "product-3", quantity: 1, unitPrice: 7 },
  ], [product]);
  assert.equal(result.deltas.get("product-1"), -2);
  assert.equal(result.deltas.get("product-2"), -2);
  assert.equal(result.deltas.get("product-3"), 3);
  assert.equal(result.replacements[1].unitCost, 3);
  assert.equal(result.replacements[1].productName, "New product");
  assert.equal(result.total, 28);
});

test("item edits reject foreign IDs, duplicate IDs, reassigned products and unavailable additions", () => {
  const item = { id: "item-1", productId: "product-1", quantity: 1, unitPrice: 5 };
  assert.throws(() => planOrderItems(old, [{ ...item, id: "foreign" }], []), /Invalid order item/);
  assert.throws(() => planOrderItems(old, [item, item], []), /Invalid order item/);
  assert.throws(() => planOrderItems(old, [{ ...item, productId: "product-2" }], []), /Invalid order item/);
  assert.throws(() => planOrderItems(old, [{ ...item, id: undefined }], []), /Product is unavailable/);
});

test("order edits validate customer fields and item amounts", () => {
  const values = { orderNumber: "ORD-1", customerName: "Alice", customerPhone: "+96170123456", customerAddress: " Beirut ", orderedAt: "2026-10-10T10:00:00.000Z", items: [{ id: "item-1", productId: "product-1", quantity: 1, unitPrice: 5 }] };
  assert.equal(orderEditSchema.parse(values).customerAddress, "Beirut");
  assert.equal(orderEditSchema.safeParse({ ...values, customerPhone: "invalid" }).success, false);
  assert.equal(orderEditSchema.safeParse({ ...values, items: [] }).success, false);
  for (const quantity of [0, -1, 1.5, 10001]) assert.equal(orderEditSchema.safeParse({ ...values, items: [{ ...values.items[0], quantity }] }).success, false);
  for (const unitPrice of [-1, Infinity, NaN]) assert.equal(orderEditSchema.safeParse({ ...values, items: [{ ...values.items[0], unitPrice }] }).success, false);
});
