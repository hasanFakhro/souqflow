import assert from "node:assert/strict";
import test from "node:test";
import { findAvailableSku, formatSku, getSkuPrefix } from "./product-sku";

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

test("Testsubject uses TES rather than its full name", () => {
  assert.equal(
    formatSku(getSkuPrefix("Testsubject", "Black", "S"), "6117"),
    "TES-BLACK-S-6117",
  );
});

test("category expands only when the complete SKU is already taken", async () => {
  const checked: string[] = [];
  const sku = await findAvailableSku("Testsubject", "Black", "S", "6117", async (candidate) => {
    checked.push(candidate);
    return candidate === "TES-BLACK-S-6117" || candidate === "TEST-BLACK-S-6117";
  });
  assert.equal(sku, "TESTS-BLACK-S-6117");
  assert.deepEqual(checked, ["TES-BLACK-S-6117", "TEST-BLACK-S-6117", "TESTS-BLACK-S-6117"]);
  assert.equal(await findAvailableSku("Testsubject", "White", "S", "6117", async () => false), "TES-WHITE-S-6117");
});

test("short and empty categories can fall back to another number when taken", async () => {
  assert.equal(await findAvailableSku("XL", null, null, "1234", async () => true), null);
  assert.equal(await findAvailableSku(null, null, null, "1234", async () => false), "1234");
});
