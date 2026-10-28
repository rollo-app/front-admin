"use server";

import { redirect } from "next/navigation";
import { ApiError, NoAccessError, adminApi, authApi } from "@/lib/api";
import { clearSessionCookie, getSessionToken, setSessionCookie } from "@/lib/session";

export type LoginState = { step: "email" | "code"; email?: string; error?: string };

const NO_ACCESS = "No tenés acceso a este panel";

function messageOf(e: unknown): string {
  return e instanceof ApiError ? e.message : "Algo salió mal. Probá de nuevo.";
}

async function safeLogout(token: string): Promise<void> {
  try {
    await authApi.logout(token);
  } catch {}
}

export async function startLogin(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  try {
    await authApi.start(email);
  } catch (e) {
    return { step: "email", email, error: messageOf(e) };
  }
  return { step: "code", email };
}

export async function verifyLogin(prev: LoginState, form: FormData): Promise<LoginState> {
  const email = prev.email ?? "";
  const code = String(form.get("code") ?? "").trim();
  let token: string;
  try {
    token = (await authApi.verify(email, code)).token;
  } catch (e) {
    return { step: "code", email, error: messageOf(e) };
  }
  let isSuperadmin = false;
  try {
    isSuperadmin = (await adminApi.me(token)).appRole === "superadmin";
  } catch (e) {
    if (!(e instanceof NoAccessError)) {
      await safeLogout(token);
      return { step: "code", email, error: messageOf(e) };
    }
  }
  if (!isSuperadmin) {
    await safeLogout(token);
    return { step: "code", email, error: NO_ACCESS };
  }
  await setSessionCookie(token);
  redirect("/");
}

export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) await safeLogout(token);
  await clearSessionCookie();
  redirect("/login");
}
