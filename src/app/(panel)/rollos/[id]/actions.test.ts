import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ redirect: vi.fn((to: string) => { throw new Error(`REDIRECT:${to}`); }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({ getSessionToken: vi.fn(), clearSessionCookie: vi.fn() }));
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<typeof import("@/lib/api")>()), adminApi: { setTripCap: vi.fn(), me: vi.fn() } }));
import { revalidatePath } from "next/cache";
import { ApiError, NoAccessError, adminApi } from "@/lib/api";
import { clearSessionCookie, getSessionToken } from "@/lib/session";
import type { AdminTripDetail } from "@/lib/types";
import { updateTripCap } from "./actions";

const trip = { id: "t1", maxMembers: 20 } as AdminTripDetail;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSessionToken).mockResolvedValue("tok");
});

describe("updateTripCap", () => {
  it("calls the backend with token, id and cap, revalidates and returns the trip", async () => {
    vi.mocked(adminApi.setTripCap).mockResolvedValue(trip);
    await expect(updateTripCap("t1", 20)).resolves.toEqual({ ok: true, trip });
    expect(adminApi.setTripCap).toHaveBeenCalledWith("tok", "t1", 20);
    expect(revalidatePath).toHaveBeenCalledWith("/rollos/t1");
    expect(revalidatePath).toHaveBeenCalledWith("/rollos");
  });
  it("returns the backend 400 message inline", async () => {
    vi.mocked(adminApi.setTripCap).mockRejectedValue(new ApiError(400, "El cupo no puede ser menor a los participantes activos"));
    await expect(updateTripCap("t1", 1)).resolves.toEqual({ ok: false, error: "El cupo no puede ser menor a los participantes activos" });
    expect(clearSessionCookie).not.toHaveBeenCalled();
  });
  it("turns unexpected failures into a generic inline error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(adminApi.setTripCap).mockRejectedValue(new TypeError("fetch failed"));
    await expect(updateTripCap("t1", 5)).resolves.toEqual({ ok: false, error: "No se pudo guardar, probá de nuevo." });
  });
  it("reports a missing rollo without logging out when the session is valid", async () => {
    vi.mocked(adminApi.setTripCap).mockRejectedValue(new NoAccessError("No encontrado"));
    vi.mocked(adminApi.me).mockResolvedValue({ id: "s", email: "s@r.t", name: null, appRole: "superadmin" });
    await expect(updateTripCap("t1", 5)).resolves.toEqual({ ok: false, error: "Ese rollo ya no existe." });
    expect(clearSessionCookie).not.toHaveBeenCalled();
  });
  it("clears the cookie and redirects to /login when the session is gone", async () => {
    vi.mocked(adminApi.setTripCap).mockRejectedValue(new NoAccessError("No encontrado"));
    vi.mocked(adminApi.me).mockRejectedValue(new NoAccessError("No encontrado"));
    await expect(updateTripCap("t1", 5)).rejects.toThrow("REDIRECT:/login");
    expect(clearSessionCookie).toHaveBeenCalled();
  });
});
