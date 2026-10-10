import assert from "node:assert/strict";
import test from "node:test";
import { customerSchema } from "./customer";

const customer = { customerName: " Alice ", customerAddress: " Beirut ", customerPhone: "+96170123456" };

test("checkout normalizes customer text and accepts international phone formatting", () => {
  assert.deepEqual(customerSchema.parse(customer), { ...customer, customerName: "Alice", customerAddress: "Beirut" });
  assert.equal(customerSchema.safeParse({ ...customer, customerPhone: "+1 (202) 555-0123" }).success, true);
});

test("checkout rejects blank, oversized and invalid customer details", () => {
  for (const change of [{ customerName: " " }, { customerAddress: " " }, { customerPhone: "123" }, { customerName: "a".repeat(101) }, { customerAddress: "a".repeat(256) }]) {
    assert.equal(customerSchema.safeParse({ ...customer, ...change }).success, false);
  }
});
