import assert from "node:assert/strict";
import test from "node:test";
import { orderStates } from "./order-state";
import { orderEditSchema, orderStateSchema, paymentStateSchema } from "./validations/order";

test("delivery states can change freely, including reopening completed orders", () => {
  for (const previousStatus of orderStates) {
    for (const status of orderStates) {
      assert.equal(orderStateSchema.safeParse({ status, previousStatus }).success, true);
    }
  }
});

test("state updates require a recognized current and next state", () => {
  assert.equal(orderStateSchema.safeParse({ status: "DONE", previousStatus: "DELIVERING" }).success, true);
  assert.equal(orderStateSchema.safeParse({ status: "DONE" }).success, false);
  assert.equal(orderStateSchema.safeParse({ status: "UNKNOWN", previousStatus: "PENDING" }).success, false);
});

test("order edits trim text and reject empty numbers, invalid dates and state bypasses", () => {
  const values = { orderNumber: "  ORD-1  ", customerName: " Guest ", orderedAt: "2026-09-16T10:00:00.000Z" };
  assert.deepEqual(orderEditSchema.parse(values), { ...values, orderNumber: "ORD-1", customerName: "Guest" });
  assert.equal(orderEditSchema.safeParse({ ...values, orderNumber: " " }).success, false);
  assert.equal(orderEditSchema.safeParse({ ...values, orderedAt: "invalid" }).success, false);
  assert.equal(orderEditSchema.safeParse({ ...values, status: "DONE" }).success, false);
});

test("payment updates validate independently and require the previous payment state", () => {
  for (const paymentStatus of ["UNPAID", "PAID", "REFUNDED"]) {
    assert.equal(paymentStateSchema.safeParse({ paymentStatus, previousPaymentStatus: "UNPAID" }).success, true);
  }
  assert.equal(paymentStateSchema.safeParse({ paymentStatus: "PAID" }).success, false);
  assert.equal(paymentStateSchema.safeParse({ paymentStatus: "DONE", previousPaymentStatus: "UNPAID" }).success, false);
  assert.equal(paymentStateSchema.safeParse({ paymentStatus: "PAID", previousPaymentStatus: "UNPAID", status: "DONE" }).success, false);
});
