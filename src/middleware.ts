import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const cookies = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (pathname === "/" || pathname === "") {
    if (cookies) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isPublic && pathname.startsWith("/dashboard")) {
    if (!cookies) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  if (isPublic && cookies) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
