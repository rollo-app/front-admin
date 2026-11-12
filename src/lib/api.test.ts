// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { ApiError, NoAccessError, adminApi, backendFetch } from "./api";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
afterEach(() => vi.restoreAllMocks());
process.env.BACKEND_URL = "http://backend.test";

describe("backendFetch", () => {
  it("sends the bearer token and JSON body to BACKEND_URL", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(json(200, { ok: 1 }));
    await expect(backendFetch("/admin/me", { token: "t", method: "PUT", body: { on: true } })).resolves.toEqual({ ok: 1 });
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("http://backend.test/admin/me");
    expect(new Headers(init!.headers).get("authorization")).toBe("Bearer t");
    expect(init!.body).toBe(JSON.stringify({ on: true }));
  });
  it("maps a 404 under /admin to NoAccessError and other errors to ApiError with the backend message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json(404, { error: "No encontrado" })).mockResolvedValueOnce(json(503, { error: "Rollo está en mantenimiento, probá más tarde" }));
    await expect(backendFetch("/admin/users")).rejects.toBeInstanceOf(NoAccessError);
    await expect(backendFetch("/trips")).rejects.toMatchObject({ status: 503, message: "Rollo está en mantenimiento, probá más tarde" } satisfies Partial<ApiError>);
  });
  it("throws when BACKEND_URL is empty", async () => {
    const prev = process.env.BACKEND_URL;
    process.env.BACKEND_URL = "";
    try {
      await expect(backendFetch("/x")).rejects.toThrow("BACKEND_URL no está configurada");
    } finally {
      process.env.BACKEND_URL = prev;
    }
  });
  it("returns undefined on 204", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await expect(backendFetch("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });
});

describe("adminApi trips", () => {
  it("lists trips with the query string under /admin/trips", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(json(200, { items: [], page: 1, pageSize: 25, total: 0 }));
    await adminApi.trips("t", new URLSearchParams({ page: "2", sort: "mediaCount", q: "pla" }));
    expect(f.mock.calls[0][0]).toBe("http://backend.test/admin/trips?page=2&sort=mediaCount&q=pla");
    expect(new Headers(f.mock.calls[0][1]!.headers).get("authorization")).toBe("Bearer t");
  });
  it("fetches one trip by encoded id", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(json(200, { id: "a/b" }));
    await adminApi.trip("t", "a/b");
    expect(f.mock.calls[0][0]).toBe("http://backend.test/admin/trips/a%2Fb");
  });
  it("PATCHes maxMembers", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(json(200, { id: "x" }));
    await adminApi.setTripCap("t", "x", 20);
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("http://backend.test/admin/trips/x");
    expect(init!.method).toBe("PATCH");
    expect(init!.body).toBe(JSON.stringify({ maxMembers: 20 }));
  });
  it("updateTrip PATCHes only the given fields", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(json(200, { id: "x" }));
    await adminApi.updateTrip("t", "x", { keepOriginals: true });
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("http://backend.test/admin/trips/x");
    expect(init!.method).toBe("PATCH");
    expect(init!.body).toBe(JSON.stringify({ keepOriginals: true }));
  });
  it("surfaces the backend 400 message and maps an unknown trip to NoAccessError", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json(400, { error: "El cupo no puede ser menor a los participantes activos" }))
      .mockResolvedValueOnce(json(404, { error: "No encontrado" }));
    await expect(adminApi.setTripCap("t", "x", 1)).rejects.toMatchObject({ status: 400, message: "El cupo no puede ser menor a los participantes activos" });
    await expect(adminApi.trip("t", "nope")).rejects.toBeInstanceOf(NoAccessError);
  });
});
