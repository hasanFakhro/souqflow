import assert from "node:assert/strict";
import test from "node:test";
import { BlobAccessError, BlobStoreNotFoundError, BlobStoreSuspendedError } from "@vercel/blob";
import { ImageUploadError, imageStorageError } from "./blob-images";

test("storage failures return actionable errors", () => {
  for (const [error, expected] of [
    [new BlobAccessError(), /rejected access/],
    [new BlobStoreNotFoundError(), /missing Blob store/],
    [new BlobStoreSuspendedError(), /suspended/],
    [new Error("Cannot use public access on a private store"), /store is private/],
  ] as const) {
    const result = imageStorageError(error);
    assert.ok(result instanceof ImageUploadError);
    assert.equal(result.status, 503);
    assert.match(result.message, expected);
  }
});

test("unexpected storage errors do not expose their contents to the user", () => {
  const result = imageStorageError(new Error("request failed with secret-token-value"));
  assert.equal(result.status, 502);
  assert.match(result.message, /Image upload failed/);
  assert.doesNotMatch(result.message, /secret-token-value/);
});
