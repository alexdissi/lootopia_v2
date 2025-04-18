import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const cookies = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  // On laisse passer les routes publiques
  const publicPaths = ["/auth/login", "/auth/register"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next();
  }

  // Si pas de session et route protégée, on redirige
  if (!cookies) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"], // Intercepte dashboard et auth
};