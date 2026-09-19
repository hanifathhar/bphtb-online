import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that do not require authentication
const publicRoutes = ["/login", "/unauthorized"];

// Routes restricted only to administrator (Level 1)
const adminOnlyRoutes = ["/master-data"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root path "/" is public (login portal)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Allow API routes (they handle their own JWT checks)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/favicon.png") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  // Check token cookie
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }

    // Check admin level for restricted routes
    if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
      const isAdmin = payload.level === 1 || payload.roleName === "ADMIN" || payload.role === "ADMIN";
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|favicon.png|uploads|images|icons).*)",
  ],
};
