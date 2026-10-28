"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, NoAccessError, adminApi } from "@/lib/api";
import { clearSessionCookie, getSessionToken } from "@/lib/session";
import type { DegradedMode } from "@/lib/types";

export async function setDegradedMode(
  on: boolean,
): Promise<{ ok: true; state: DegradedMode } | { ok: false; error: string }> {
  const token = await getSessionToken();
  try {
    const state = await adminApi.setDegraded(token, on);
    revalidatePath("/");
    return { ok: true, state };
  } catch (e) {
    // NoAccessError extends ApiError: it must not become an inline error (see the redirect below).
    if (!(e instanceof NoAccessError)) {
      if (e instanceof ApiError) return { ok: false, error: e.message };
      throw e;
    }
  }
  // Session no longer valid: drop the cookie and go to login (redirect throws, so keep it outside try/catch).
  await clearSessionCookie();
  redirect("/login");
}
