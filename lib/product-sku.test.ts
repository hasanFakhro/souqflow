import assert from "node:assert/strict";
import test from "node:test";
import { formatSku, getSkuPrefix } from "./product-sku";

test("SKU uses category, color and size in order and changes with each field", () => {
  assert.equal(getSkuPrefix("Shirts", "Black", "M"), "SHIRTS-BLACK-M");
  assert.equal(getSkuPrefix("Pants", "Black", "M"), "PANTS-BLACK-M");
  assert.equal(getSkuPrefix("Shirts", "White", "M"), "SHIRTS-WHITE-M");
  assert.equal(getSkuPrefix("Shirts", "Black", "L"), "SHIRTS-BLACK-L");
});

test("empty fields are omitted without NA or stray separators", () => {
  assert.equal(formatSku(getSkuPrefix(null, "Black", ""), "1234"), "BLACK-1234");
  assert.equal(formatSku(getSkuPrefix("", "", ""), "1234"), "1234");
  assert.equal(getSkuPrefix(" قمصان ", " blue / green ", "XL"), "قمصان-BLUEGREEN-XL");
});

test("SKU stays within the schema's 50 character limit", () => {
  assert.ok(formatSku(getSkuPrefix("A".repeat(100), "B".repeat(50), "C".repeat(20)), "1234").length <= 50);
});
