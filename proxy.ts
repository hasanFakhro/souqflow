import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRequestOrigin } from "@/lib/request-origin";
import {
  getSubscriptionState,
  isSubscriptionExempt,
} from "@/lib/subscription";

const publicPaths = new Set([
  "/signin",
  "/register",
  "/error",
]);

export default auth(async (request) => {
  const { pathname } = request.nextUrl;
  const origin = getRequestOrigin(request.headers, request.url);

  if (publicPaths.has(pathname) || pathname.startsWith("/catalog/")) {
    return NextResponse.next();
  }

  // Check if user is logged in
  const user = request.auth?.user as
    | {
        id?: string;
        role?: string;
      }
    | undefined;

  if (!user?.id) {
    return NextResponse.redirect(new URL("/signin", origin));
  }

  // The checkout price needs conversion before a subscription is activated.
  if (pathname === "/api/exchangerate" && request.method === "GET") {
    return NextResponse.next();
  }

  if (isSubscriptionExempt(user.role)) {
    return pathname === "/subscription"
      ? NextResponse.redirect(new URL("/", origin))
      : NextResponse.next();
  }

  const subscription = await getSubscriptionState(user.id);

  if (!subscription.isActive && pathname !== "/subscription") {
    return NextResponse.redirect(
      new URL("/subscription", origin)
    );
  }

  if (subscription.isActive && pathname === "/subscription") {
    return NextResponse.redirect(new URL("/", origin));
  }

  // User is authenticated → allow navigation
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|api/register|api/subscription|api/catalog|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
