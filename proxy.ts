import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicPaths = new Set([
  "/signin",
  "/register",
  "/error",
]);

export default auth(async (request) => {
  const { pathname } = request.nextUrl;

  // Public pages
  if (publicPaths.has(pathname)) {
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
    return NextResponse.redirect(
      new URL("/signin", request.url),
    );
  }

  // User is authenticated → allow navigation
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|api/register|api/subscription|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};