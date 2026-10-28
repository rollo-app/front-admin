import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: vi.fn((to: string) => { throw new Error(`REDIRECT:${to}`); }) }));
vi.mock("@/lib/session", () => ({ getSessionToken: vi.fn(), clearSessionCookie: vi.fn() }));
vi.mock("./session", () => ({ getSessionToken: vi.fn(), clearSessionCookie: vi.fn() }));
vi.mock("./api", async (orig) => ({ ...(await orig<any>()), adminApi: { me: vi.fn() } }));
import { NoAccessError, adminApi } from "./api";
import { getSessionToken } from "./session";
import { requireSession } from "./auth";

beforeEach(() => vi.clearAllMocks());

describe("requireSession", () => {
  it("redirects to /login without a cookie", async () => {
    (getSessionToken as any).mockResolvedValue(null);
    await expect(requireSession()).rejects.toThrow("REDIRECT:/login");
  });
  it("redirects to /logout when the backend rejects the session", async () => {
    (getSessionToken as any).mockResolvedValue("tok");
    (adminApi.me as any).mockRejectedValue(new NoAccessError("No encontrado"));
    await expect(requireSession()).rejects.toThrow("REDIRECT:/logout");
  });
  it("returns token and me", async () => {
    const me = { id: "1", email: "su@rollo.test", name: "J", appRole: "superadmin" };
    (getSessionToken as any).mockResolvedValue("tok");
    (adminApi.me as any).mockResolvedValue(me);
    expect(await requireSession()).toEqual({ token: "tok", me });
  });
});
