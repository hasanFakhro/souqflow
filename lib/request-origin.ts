/** Resolve the public origin rather than an internal server address. */
export function getRequestOrigin(requestHeaders: Headers, fallback: string) {
  const host = requestHeaders.get("x-forwarded-host")?.split(",")[0].trim()
    || requestHeaders.get("host");
  if (!host) return new URL(fallback).origin;

  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim()
    || (process.env.VERCEL ? "https" : new URL(fallback).protocol.replace(":", ""));
  return new URL(`${protocol}://${host}`).origin;
}
