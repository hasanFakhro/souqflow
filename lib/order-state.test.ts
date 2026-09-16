import assert from "node:assert/strict";
import test from "node:test";
import { orderStateTransitions } from "./order-state";
import { orderEditSchema, orderStateSchema } from "./validations/order";

test("orders follow delivery stages and can recover from problems", () => {
  assert.deepEqual(orderStateTransitions.PENDING, ["DELIVERING", "PROBLEM"]);
  assert.deepEqual(orderStateTransitions.DELIVERING, ["DONE", "PROBLEM"]);
  assert.deepEqual(orderStateTransitions.PROBLEM, ["PENDING", "DELIVERING"]);
  assert.deepEqual(orderStateTransitions.DONE, []);
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
