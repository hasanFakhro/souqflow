import assert from "node:assert/strict";
import { test } from "node:test";
import { IMAGE_TYPES, MAX_IMAGE_SIZE, validateImageFile } from "./image-file";

test("supported images accept the 4 MB boundary and reject larger files", () => {
  for (const type of Object.keys(IMAGE_TYPES)) {
    assert.equal(validateImageFile({ type, size: MAX_IMAGE_SIZE }), null);
    assert.match(validateImageFile({ type, size: MAX_IMAGE_SIZE + 1 })!, /4 MB/);
  }
});

test("image uploads reject empty files and unsupported content types", () => {
  assert.match(validateImageFile({ type: "image/png", size: 0 })!, /non-empty/);
  for (const type of ["image/svg+xml", "text/html", "", "toString"]) {
    assert.match(validateImageFile({ type, size: 100 })!, /JPEG/);
  }
});
