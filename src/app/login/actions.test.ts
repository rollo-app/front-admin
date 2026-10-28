import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ redirect: vi.fn((to: string) => { throw new Error(`REDIRECT:${to}`); }) }));
vi.mock("@/lib/session", () => ({ setSessionCookie: vi.fn(), clearSessionCookie: vi.fn(), getSessionToken: vi.fn() }));
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<typeof import("@/lib/api")>()), authApi: { start: vi.fn(), verify: vi.fn(), logout: vi.fn() }, adminApi: { me: vi.fn() } }));
import { ApiError, NoAccessError, adminApi, authApi } from "@/lib/api";
import { setSessionCookie } from "@/lib/session";
import { startLogin, verifyLogin } from "./actions";

const form = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };
beforeEach(() => vi.clearAllMocks());

describe("login actions", () => {
  it("startLogin moves to the code step", async () => {
    vi.mocked(authApi.start).mockResolvedValue(undefined);
    expect(await startLogin({ step: "email" }, form({ email: "su@rollo.test" }))).toEqual({ step: "code", email: "su@rollo.test" });
  });
  it("startLogin shows the backend error", async () => {
    vi.mocked(authApi.start).mockRejectedValue(new ApiError(429, "Esperá un momento antes de pedir otro código"));
    expect(await startLogin({ step: "email" }, form({ email: "su@rollo.test" }))).toMatchObject({ step: "email", error: "Esperá un momento antes de pedir otro código" });
  });
  it("verifyLogin sets the cookie and redirects a superadmin", async () => {
    vi.mocked(authApi.verify).mockResolvedValue({ token: "tok" });
    vi.mocked(adminApi.me).mockResolvedValue({ id: "1", email: "su@rollo.test", name: "Juani", appRole: "superadmin" });
    await expect(verifyLogin({ step: "code", email: "su@rollo.test" }, form({ code: "ABC234" }))).rejects.toThrow("REDIRECT:/");
    expect(setSessionCookie).toHaveBeenCalledWith("tok");
  });
  it("verifyLogin logs out a plain user and says no access", async () => {
    vi.mocked(authApi.verify).mockResolvedValue({ token: "tok" });
    vi.mocked(adminApi.me).mockRejectedValue(new NoAccessError("No encontrado"));
    expect(await verifyLogin({ step: "code", email: "u@rollo.test" }, form({ code: "ABC234" }))).toMatchObject({ step: "code", error: "No tenés acceso a este panel" });
    expect(authApi.logout).toHaveBeenCalledWith("tok");
    expect(setSessionCookie).not.toHaveBeenCalled();
  });
});
