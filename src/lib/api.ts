import "server-only";
import type { AdminMe, AdminUser, AdminUserDetail, DegradedMode, MetricsResponse, Page, UsageResponse } from "./types";

export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/** 404 from /admin/*: the backend hides the admin API from non-admins. */
export class NoAccessError extends ApiError {
  constructor(message = "Sin acceso") {
    super(404, message);
    this.name = "NoAccessError";
  }
}

export async function backendFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const base = (process.env.BACKEND_URL ?? "").replace(/\/+$/, "");
  if (!base) throw new Error("BACKEND_URL no está configurada");
  const headers = new Headers();
  if (init.token) headers.set("authorization", `Bearer ${init.token}`);
  if (init.body !== undefined) headers.set("content-type", "application/json");
  const res = await fetch(`${base}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data as { error?: string } | null)?.error ?? "Error";
    if (res.status === 404 && path.startsWith("/admin")) throw new NoAccessError(message);
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export const adminApi = {
  me: (token: string | null) => backendFetch<AdminMe>("/admin/me", { token }),
  metrics: (token: string | null, days = 30) => backendFetch<MetricsResponse>(`/admin/metrics?days=${days}`, { token }),
  usage: (token: string | null) => backendFetch<UsageResponse>("/admin/usage", { token }),
  degraded: (token: string | null) => backendFetch<DegradedMode>("/admin/degraded-mode", { token }),
  setDegraded: (token: string | null, on: boolean) =>
    backendFetch<DegradedMode>("/admin/degraded-mode", { method: "PUT", body: { on }, token }),
  users: (token: string | null, query: URLSearchParams) =>
    backendFetch<Page<AdminUser>>(`/admin/users?${query}`, { token }),
  user: (token: string | null, id: string) =>
    backendFetch<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`, { token }),
};

export const authApi = {
  start: (email: string) => backendFetch<void>("/auth/email/start", { method: "POST", body: { email } }),
  verify: (email: string, code: string) =>
    backendFetch<{ token: string }>("/auth/email/verify", { method: "POST", body: { email, code } }),
  logout: (token: string) => backendFetch<void>("/auth/logout", { method: "POST", token }),
};
