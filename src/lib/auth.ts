import "server-only";
import { redirect } from "next/navigation";
import { NoAccessError, adminApi } from "./api";
import type { AdminMe } from "./types";
import { clearSessionCookie, getSessionToken } from "./session";

/** For Server Components: validates the session against the backend or redirects to /login. */
export async function requireSession(): Promise<{ token: string; me: AdminMe }> {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  let me: AdminMe;
  try {
    me = await adminApi.me(token);
  } catch (e) {
    if (e instanceof NoAccessError) {
      // Server Components cannot always mutate cookies; best effort, redirect regardless.
      try { await clearSessionCookie(); } catch {}
      redirect("/login");
    }
    throw e;
  }
  return { token, me };
}
