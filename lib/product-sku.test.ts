import assert from "node:assert/strict";
import test from "node:test";
import { formatSku, getSkuPrefix } from "./product-sku";

test("SKU uses category, color and size in order and changes with each field", () => {
  assert.equal(getSkuPrefix("Shirts", "Black", "M"), "SHI-BLACK-M");
  assert.equal(getSkuPrefix("Pants", "Black", "M"), "PAN-BLACK-M");
  assert.equal(getSkuPrefix("Shirts", "White", "M"), "SHI-WHITE-M");
  assert.equal(getSkuPrefix("Shirts", "Black", "L"), "SHI-BLACK-L");
});

test("empty fields are omitted without NA or stray separators", () => {
  assert.equal(formatSku(getSkuPrefix(null, "Black", ""), "1234"), "BLACK-1234");
  assert.equal(formatSku(getSkuPrefix("", "", ""), "1234"), "1234");
  assert.equal(getSkuPrefix(" قمصان ", " blue / green ", "XL"), "قمص-BLUEGREEN-XL");
});

test("SKU stays within the schema's 50 character limit", () => {
  assert.ok(formatSku(getSkuPrefix("A".repeat(100), "B".repeat(50), "C".repeat(20)), "1234").length <= 50);
});

test("category abbreviations expand when their first three letters collide", () => {
  const categories = ["Shirts", "Shirtsleeves", "Shipping", "Shoes"];
  assert.equal(getSkuPrefix("Shipping", "Black", "M", categories), "SHIP-BLACK-M");
  assert.equal(getSkuPrefix("Shirtsleeves", "Black", "M", categories), "SHIRTSL-BLACK-M");
  assert.equal(getSkuPrefix("Shoes", "Black", "M", categories), "SHO-BLACK-M");
  assert.equal(getSkuPrefix("XL", "", "", categories), "XL");
});
