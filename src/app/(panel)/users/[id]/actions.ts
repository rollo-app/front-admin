"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, NoAccessError, adminApi, type UserPatch } from "@/lib/api";
import { clearSessionCookie, getSessionToken } from "@/lib/session";
import type { AdminUserDetail } from "@/lib/types";

export async function updateUser(
  id: string,
  patch: UserPatch,
): Promise<{ ok: true; user: AdminUserDetail } | { ok: false; error: string }> {
  // Only send what was provided, so an untouched field (e.g. username) never reaches the backend.
  const body = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as UserPatch;
  const token = await getSessionToken();
  try {
    const user = await adminApi.editUser(token, id, body);
    revalidatePath(`/users/${id}`);
    revalidatePath("/users");
    return { ok: true, user };
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
