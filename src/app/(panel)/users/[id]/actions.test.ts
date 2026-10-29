import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ redirect: vi.fn((to: string) => { throw new Error(`REDIRECT:${to}`); }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({ getSessionToken: vi.fn(), clearSessionCookie: vi.fn() }));
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<typeof import("@/lib/api")>()), adminApi: { editUser: vi.fn(), me: vi.fn() } }));
import { revalidatePath } from "next/cache";
import { ApiError, NoAccessError, adminApi } from "@/lib/api";
import { clearSessionCookie, getSessionToken } from "@/lib/session";
import type { AdminUserDetail } from "@/lib/types";
import { updateUser } from "./actions";

const user = { id: "u1", name: "Ana" } as AdminUserDetail;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSessionToken).mockResolvedValue("tok");
});

describe("updateUser", () => {
  it("sends only the provided fields", async () => {
    vi.mocked(adminApi.editUser).mockResolvedValue(user);
    await updateUser("u1", { name: "Ana", username: undefined, badge: null });
    expect(adminApi.editUser).toHaveBeenCalledWith("tok", "u1", { name: "Ana", badge: null });
  });
  it("clears the cookie and redirects to /login when the session expired", async () => {
    vi.mocked(adminApi.editUser).mockRejectedValue(new NoAccessError("No encontrado"));
    vi.mocked(adminApi.me).mockRejectedValue(new NoAccessError("No encontrado"));
    await expect(updateUser("u1", { name: "x" })).rejects.toThrow("REDIRECT:/login");
    expect(clearSessionCookie).toHaveBeenCalled();
  });
  it("logs out only when the session check also fails", async () => {
    vi.mocked(adminApi.editUser).mockRejectedValue(new NoAccessError("No encontrado"));
    vi.mocked(adminApi.me).mockRejectedValue(new NoAccessError("No encontrado"));
    await expect(updateUser("u1", { name: "x" })).rejects.toThrow("REDIRECT:/login");
    expect(clearSessionCookie).toHaveBeenCalled();
  });
  it("reports a deleted user without logging out when the session is still valid", async () => {
    vi.mocked(adminApi.editUser).mockRejectedValue(new NoAccessError("No encontrado"));
    vi.mocked(adminApi.me).mockResolvedValue({ id: "s", email: "s@r.t", name: null, appRole: "superadmin" });
    await expect(updateUser("u1", { name: "x" })).resolves.toEqual({ ok: false, error: "Ese usuario ya no existe." });
    expect(clearSessionCookie).not.toHaveBeenCalled();
  });
  it("turns unexpected failures into an inline error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(adminApi.editUser).mockRejectedValue(new TypeError("fetch failed"));
    await expect(updateUser("u1", { name: "x" })).resolves.toEqual({ ok: false, error: "No se pudo guardar, probá de nuevo." });
  });
  it("returns the backend error for ApiErrors", async () => {
    vi.mocked(adminApi.editUser).mockRejectedValue(new ApiError(409, "Ese nombre de usuario ya está en uso"));
    await expect(updateUser("u1", { username: "ana" })).resolves.toEqual({
      ok: false,
      error: "Ese nombre de usuario ya está en uso",
      field: "username",
    });
    expect(clearSessionCookie).not.toHaveBeenCalled();
  });
  it("revalidates both paths and returns the user on success", async () => {
    vi.mocked(adminApi.editUser).mockResolvedValue(user);
    await expect(updateUser("u1", { name: "Ana" })).resolves.toEqual({ ok: true, user });
    expect(revalidatePath).toHaveBeenCalledWith("/users/u1");
    expect(revalidatePath).toHaveBeenCalledWith("/users");
  });
});
