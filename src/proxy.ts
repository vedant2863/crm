import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import envConfig from "@/lib/config/envconfig";
import { authRateLimiter, apiRateLimiter } from "@/lib/rate-limiter";

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

/**
 * Auth-related API prefixes that get stricter rate limiting (30 req/min per IP).
 */
const AUTH_RATE_LIMIT_PREFIXES = ["/api/auth/callback", "/api/auth/signin"];

/** Extract client IP from request headers. */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Add rate limit headers to a response. */
function withRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  limit: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow Next.js internals and public API prefixes
  if (ALWAYS_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Rate limit auth endpoints (per IP)
  if (AUTH_RATE_LIMIT_PREFIXES.some((p) => pathname.startsWith(p))) {
    const ip = getClientIP(request);
    const result = authRateLimiter.check(`auth:${ip}`);
    if (!result.allowed) {
      const res = NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests" } },
        { status: 429 }
      );
      res.headers.set("Retry-After", String(result.retryAfterSeconds));
      return res;
    }
  }

  // 3. Allow explicitly listed public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 4. Retrieve NextAuth session token
  const token = await getToken({
    req: request,
    secret: envConfig.auth.secret,
  });

  // 5. Redirect unauthenticated users to /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 6. Redirect authenticated users visiting /login or /register to /dashboard
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 7. Rate limit API endpoints for authenticated users (per user ID)
  if (pathname.startsWith("/api/")) {
    const userId = (token.id as string) || getClientIP(request);
    const result = apiRateLimiter.check(`api:${userId}`);
    if (!result.allowed) {
      const res = NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests" } },
        { status: 429 }
      );
      res.headers.set("Retry-After", String(result.retryAfterSeconds));
      return res;
    }
    const response = NextResponse.next();
    return withRateLimitHeaders(response, result.remaining, result.limit);
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
