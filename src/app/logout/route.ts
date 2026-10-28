import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

// Route Handlers can set cookies (Server Components cannot): clears a stale session.
export async function GET(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}
