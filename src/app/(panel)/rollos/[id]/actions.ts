"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, NoAccessError, adminApi } from "@/lib/api";
import { clearSessionCookie, getSessionToken } from "@/lib/session";
import type { AdminTripDetail } from "@/lib/types";

export type UpdateTripCapResult = { ok: true; trip: AdminTripDetail } | { ok: false; error: string };

export async function updateTripCap(id: string, maxMembers: number): Promise<UpdateTripCapResult> {
  return runTripUpdate("updateTripCap", id, (token) => adminApi.setTripCap(token, id, maxMembers));
}

export async function updateTripOriginals(id: string, keepOriginals: boolean): Promise<UpdateTripCapResult> {
  return runTripUpdate("updateTripOriginals", id, (token) => adminApi.updateTrip(token, id, { keepOriginals }));
}

async function runTripUpdate(
  label: string,
  id: string,
  call: (token: string | null) => Promise<AdminTripDetail>,
): Promise<UpdateTripCapResult> {
  const token = await getSessionToken();
  try {
    const trip = await call(token);
    revalidatePath(`/rollos/${id}`);
    revalidatePath("/rollos");
    return { ok: true, trip };
  } catch (e) {
    // NoAccessError extends ApiError: it is handled below, not as an inline error.
    if (!(e instanceof NoAccessError)) {
      if (e instanceof ApiError) return { ok: false, error: e.message };
      console.error(`${label} failed`, e);
      return { ok: false, error: "No se pudo guardar, probá de nuevo." };
    }
  }
  // A 404 is also what a deleted rollo looks like: only log out if the session itself is gone.
  try {
    await adminApi.me(token);
    return { ok: false, error: "Ese rollo ya no existe." };
  } catch (e) {
    if (!(e instanceof ApiError)) {
      console.error(`${label} session check failed`, e);
      return { ok: false, error: "No se pudo guardar, probá de nuevo." };
    }
  }
  await clearSessionCookie();
  redirect("/login");
}
