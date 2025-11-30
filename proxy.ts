import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const loginRoute = "/login"

const publicRoutes = ["/", loginRoute];

const indexRoute = "/search/trademarks";


export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token");

  if (!token) {
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = loginRoute;
    return NextResponse.redirect(url);
  }

  if (token && publicRoutes.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = indexRoute;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
