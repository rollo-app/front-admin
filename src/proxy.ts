import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-constants";

// Cheap presence check only; requireSession() does the real validation.
export function proxy(request: NextRequest) {
  const hasCookie = request.cookies.has(SESSION_COOKIE);
  const isLogin = request.nextUrl.pathname === "/login";
  if (!hasCookie && !isLogin) return NextResponse.redirect(new URL("/login", request.url));
  if (hasCookie && isLogin) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
