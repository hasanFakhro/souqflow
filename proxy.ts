import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSubscriptionState, isSubscriptionExempt } from "@/lib/subscription";

const publicPaths = new Set(["/signin", "/register", "/error"]);

export default auth(async (request) => {
  const { pathname } = request.nextUrl;

  if (publicPaths.has(pathname)) {
    return NextResponse.next();
  }

  const user = request.auth?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isSubscriptionExempt(user.role)) {
    return pathname === "/subscription"
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  const subscription = await getSubscriptionState(user.id);

  if (!subscription.isActive && pathname !== "/subscription") {
    return NextResponse.redirect(new URL("/subscription", request.url));
  }

  if (subscription.isActive && pathname === "/subscription") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|api/register|api/subscription|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
