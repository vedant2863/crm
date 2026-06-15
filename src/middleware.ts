import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl.clone();
    const hostname = req.headers.get("host") || "";

    // Remove port from hostname if present
    const cleanHost = hostname.split(":")[0];
    
    // Check if we are on local or main domain
    const isLocal = cleanHost.endsWith("localhost");
    const isMain = cleanHost.endsWith("crm.com");
    
    let currentSubdomain = "";
    if (isLocal) {
      const parts = cleanHost.split(".");
      // If we have something like "john.localhost"
      if (parts.length > 1 && parts[parts.length - 2] !== "www") {
        currentSubdomain = parts.slice(0, -1).join(".");
      }
    } else if (isMain) {
      const parts = cleanHost.split(".");
      // If we have something like "john.crm.com" (at least 3 segments)
      if (parts.length > 2 && parts[parts.length - 3] !== "www") {
        currentSubdomain = parts.slice(0, -2).join(".");
      }
    }

    const token = req.nextauth?.token;
    const isAuthPage = url.pathname === "/login" || url.pathname === "/register";

    // Redirect authenticated users trying to access login/register back to dashboard
    if (token && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Check if we should execute subdomain rewrite
    const isSubdomain = !!currentSubdomain;

    // Only rewrite the homepage path ("/") for tenant subdomains
    if (isSubdomain && url.pathname === "/") {
      url.pathname = `/${currentSubdomain}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Authorize public paths
        const isPublic =
          PUBLIC_ROUTES.includes(pathname) ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/seed") ||
          pathname.startsWith("/api/tenant");

        if (isPublic) return true;

        // Require token for protected workspace paths
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
