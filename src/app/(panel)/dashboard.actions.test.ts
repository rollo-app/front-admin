import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ redirect: vi.fn((to: string) => { throw new Error(`REDIRECT:${to}`); }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({ getSessionToken: vi.fn(), clearSessionCookie: vi.fn() }));
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<typeof import("@/lib/api")>()), adminApi: { setDegraded: vi.fn() } }));
import { revalidatePath } from "next/cache";
import { ApiError, NoAccessError, adminApi } from "@/lib/api";
import { clearSessionCookie, getSessionToken } from "@/lib/session";
import { setDegradedMode } from "./dashboard.actions";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSessionToken).mockResolvedValue("tok");
});

describe("setDegradedMode", () => {
  it("clears the cookie and redirects to /login when the session expired", async () => {
    vi.mocked(adminApi.setDegraded).mockRejectedValue(new NoAccessError("No encontrado"));
    await expect(setDegradedMode(true)).rejects.toThrow("REDIRECT:/login");
    expect(clearSessionCookie).toHaveBeenCalled();
  });
  it("returns the backend error for other ApiErrors", async () => {
    vi.mocked(adminApi.setDegraded).mockRejectedValue(new ApiError(503, "En mantenimiento"));
    await expect(setDegradedMode(true)).resolves.toEqual({ ok: false, error: "En mantenimiento" });
    expect(clearSessionCookie).not.toHaveBeenCalled();
  });
  it("revalidates and returns the state on success", async () => {
    const state = { on: true, updatedAt: 1, updatedBy: { id: "1", email: "su@rollo.test" } };
    vi.mocked(adminApi.setDegraded).mockResolvedValue(state);
    await expect(setDegradedMode(true)).resolves.toEqual({ ok: true, state });
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});
