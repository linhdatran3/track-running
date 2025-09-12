import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ignore public assets and API
  if (pathname.startsWith("/api")) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.includes("."))
    return NextResponse.next();

  const session = req.cookies.get("session")?.value;
  // const protectedRoutes = ["/run", "/dashboard", "/api"];
  // const needsAuth = protectedRoutes.some(
  //   (p) => pathname === p || pathname.startsWith(p + "/")
  // );
  // console.log("==========================");
  // console.log("needsAuth", needsAuth);
  // console.log("session", session);

  if (pathname !== "/login" && !session) {
    // redirect to home (login)
    const url = req.nextUrl.clone();
    console.log("Please login");
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
