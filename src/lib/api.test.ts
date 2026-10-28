// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, NoAccessError, backendFetch } from "./api";

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
  it("returns undefined on 204", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await expect(backendFetch("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });
});
