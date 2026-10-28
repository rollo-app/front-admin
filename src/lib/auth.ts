import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { NoAccessError, adminApi } from "./api";
import type { AdminMe } from "./types";
import { getSessionToken } from "./session";

/**
 * For Server Components: no cookie -> /login; backend says no access -> /logout (clears the cookie).
 * Memoized per render so layout and page share one /admin/me call.
 */
export const requireSession = cache(async (): Promise<{ token: string; me: AdminMe }> => {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  let me: AdminMe;
  try {
    me = await adminApi.me(token);
  } catch (e) {
    // Rejected session: /logout (a Route Handler) revalidates and clears the cookie, then lands on /login.
    // Any other error (5xx, 429, degraded) is rethrown to the error boundary; the cookie stays.
    if (e instanceof NoAccessError) redirect("/logout");
    throw e;
  }
  return { token, me };
});
