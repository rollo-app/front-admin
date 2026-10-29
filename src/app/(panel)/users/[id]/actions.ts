"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, NoAccessError, adminApi, type UserPatch } from "@/lib/api";
import { clearSessionCookie, getSessionToken } from "@/lib/session";
import type { AdminUserDetail } from "@/lib/types";

export type UpdateUserResult =
  | { ok: true; user: AdminUserDetail }
  | { ok: false; error: string; field?: "username" };

export async function updateUser(id: string, patch: UserPatch): Promise<UpdateUserResult> {
  // Only send what was provided, so an untouched field (e.g. username) never reaches the backend.
  const body = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as UserPatch;
  const token = await getSessionToken();
  try {
    const user = await adminApi.editUser(token, id, body);
    revalidatePath(`/users/${id}`);
    revalidatePath("/users");
    return { ok: true, user };
  } catch (e) {
    // NoAccessError extends ApiError: it is handled below, not as an inline error.
    if (!(e instanceof NoAccessError)) {
      if (e instanceof ApiError) {
        const usernameIssue = "username" in body && /nombre de usuario/i.test(e.message);
        return usernameIssue ? { ok: false, error: e.message, field: "username" } : { ok: false, error: e.message };
      }
      console.error("updateUser failed", e);
      return { ok: false, error: "No se pudo guardar, probá de nuevo." };
    }
  }
  // A 404 is also what a deleted user looks like: only log out if the session itself is gone.
  try {
    await adminApi.me(token);
    return { ok: false, error: "Ese usuario ya no existe." };
  } catch (e) {
    if (!(e instanceof ApiError)) {
      console.error("updateUser session check failed", e);
      return { ok: false, error: "No se pudo guardar, probá de nuevo." };
    }
  }
  await clearSessionCookie();
  redirect("/login");
}
