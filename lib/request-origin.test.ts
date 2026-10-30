import assert from "node:assert/strict";
import test from "node:test";
import { getRequestOrigin } from "./request-origin";

test("Vercel redirects use the forwarded domain instead of internal localhost", () => {
  const headers = new Headers({
    host: "localhost:3000",
    "x-forwarded-host": "shop.vercel.app",
    "x-forwarded-proto": "https",
  });
  const origin = getRequestOrigin(headers, "http://localhost:3000");
  assert.equal(new URL("/signin", origin).href, "https://shop.vercel.app/signin");
});

test("forwarded header lists use the first public host and protocol", () => {
  const headers = new Headers({
    "x-forwarded-host": "preview.vercel.app, internal",
    "x-forwarded-proto": "https, http",
  });
  assert.equal(getRequestOrigin(headers, "http://localhost:3000"), "https://preview.vercel.app");
});

test("local development keeps its HTTP origin", () => {
  const headers = new Headers({ host: "localhost:3000", "x-forwarded-proto": "http" });
  assert.equal(getRequestOrigin(headers, "http://localhost:3000"), "http://localhost:3000");
});
