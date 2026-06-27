import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import envConfig from "@/lib/config/envconfig";

/**
 * Paths that are always accessible without a session.
 */
const PUBLIC_PATHS = ["/", "/login", "/register"];

/**
 * Path prefixes that bypass middleware entirely.
 */
const ALWAYS_ALLOWED_PREFIXES = [
  "/api/auth",   // NextAuth API route handler endpoints
  "/api/seed",   // Seeding endpoint (dev only)
  "/_next",      // Next.js build assets
  "/favicon.ico",
  "/images",
  "/icons",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow Next.js internals and public API prefixes
  if (ALWAYS_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Allow explicitly listed public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Retrieve NextAuth session token
  const token = await getToken({
    req: request,
    secret: envConfig.auth.secret,
  });

  // 4. Redirect unauthenticated users to /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. Redirect authenticated users visiting /login or /register to /dashboard
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

/**
 * Matcher: run middleware on all routes EXCEPT Next.js static assets.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|images|icons).*)",
  ],
};
