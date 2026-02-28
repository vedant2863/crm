import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;

    // 1. If user is logged in and tries to access login/register,redirect them to the dashboard.
    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (token && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // 2. Gatekeeper: If this returns false, NextAuth redirects to sign-in.
        // We must return true for all public routes.
        const isPublic =
          PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/api/auth");

        if (isPublic) return true;

        // 3. For any other route (protected), require a token.
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
