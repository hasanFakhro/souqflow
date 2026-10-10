import assert from "node:assert/strict";
import test from "node:test";
import { isLowStock } from "./stock";

test("low-stock checks honor product thresholds, including disabled thresholds", () => {
  assert.equal(isLowStock(10, 10), true);
  assert.equal(isLowStock(11, 10), false);
  assert.equal(isLowStock(4, 2), false);
  assert.equal(isLowStock(1, null), false);
  assert.equal(isLowStock(0, null), true);
  assert.equal(isLowStock(-2, null), true);
});
