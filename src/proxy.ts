import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import envConfig from "@/lib/config/envconfig";
import { authRateLimiter, apiRateLimiter } from "@/lib/rate-limiter";


/**
 * Path prefixes that bypass middleware/proxy entirely.
 */
const ALWAYS_ALLOWED_PREFIXES = [
  "/healthz",    // Production health check probe endpoint
  "/api/healthz",// Alternative API health check probe endpoint
  "/api/auth",   // NextAuth API route handler endpoints
  "/api/seed",   // Seeding endpoint (dev only)
  "/api/socket", // Socket.io engine endpoint
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

  // 3. Allow landing page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 4. Retrieve NextAuth session token (checks both secure and non-secure cookie conventions)
  const token =
    (await getToken({
      req: request,
      secret: envConfig.auth.secret,
      cookieName: "__Secure-next-auth.session-token",
      secureCookie: true,
    })) ||
    (await getToken({
      req: request,
      secret: envConfig.auth.secret,
      cookieName: "next-auth.session-token",
      secureCookie: false,
    })) ||
    (await getToken({
      req: request,
      secret: envConfig.auth.secret,
    }));

  // 5. If already authenticated and visiting /login or /register -> redirect to /dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 6. Allow unauthenticated access to /login and /register
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.next();
  }

  // 7. Redirect unauthenticated users visiting protected routes to /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
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
 * Matcher: run proxy on all routes EXCEPT Next.js static assets.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|images|icons).*)",
  ],
};
