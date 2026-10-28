import "server-only";
import { redirect } from "next/navigation";
import { ApiError, adminApi } from "./api";
import type { AdminMe } from "./types";
import { getSessionToken } from "./session";

/** For Server Components: validates the session against the backend or redirects to /login. */
export async function requireSession(): Promise<{ token: string; me: AdminMe }> {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  let me: AdminMe;
  try {
    me = await adminApi.me(token);
  } catch (e) {
    // Stale/rejected session: /logout (a Route Handler) clears the cookie, then lands on /login.
    if (e instanceof ApiError) redirect("/logout");
    throw e;
  }
  return { token, me };
}
