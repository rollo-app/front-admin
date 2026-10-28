import { NextResponse } from "next/server";
import { NoAccessError, adminApi } from "@/lib/api";
import { clearSessionCookie, getSessionToken } from "@/lib/session";

// Route Handlers can set cookies (Server Components cannot). Not a blind logout (a cross-site
// GET must not sign the admin out): it only clears a cookie the backend rejects.
// The real logout is the "Salir" Server Action.
export async function GET(request: Request) {
  const token = await getSessionToken();
  if (token) {
    try {
      await adminApi.me(token);
      return NextResponse.redirect(new URL("/", request.url));
    } catch (e) {
      if (!(e instanceof NoAccessError)) throw e;
      await clearSessionCookie();
    }
  }
  return NextResponse.redirect(new URL("/login", request.url));
}
