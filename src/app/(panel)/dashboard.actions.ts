"use server";

import { revalidatePath } from "next/cache";
import { ApiError, adminApi } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
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
    if (e instanceof ApiError) return { ok: false, error: e.message };
    throw e;
  }
}
