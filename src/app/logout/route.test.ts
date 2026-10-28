import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/session", () => ({ clearSessionCookie: vi.fn(), getSessionToken: vi.fn() }));
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<typeof import("@/lib/api")>()), adminApi: { me: vi.fn() } }));
import { ApiError, NoAccessError, adminApi } from "@/lib/api";
import { clearSessionCookie, getSessionToken } from "@/lib/session";
import { GET } from "./route";

const req = () => new Request("http://localhost:3000/logout");
beforeEach(() => vi.clearAllMocks());

describe("GET /logout", () => {
  it("without a token goes to /login", async () => {
    vi.mocked(getSessionToken).mockResolvedValue(null);
    const res = await GET(req());
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
    expect(clearSessionCookie).not.toHaveBeenCalled();
  });
  it("clears a rejected cookie and goes to /login", async () => {
    vi.mocked(getSessionToken).mockResolvedValue("tok");
    vi.mocked(adminApi.me).mockRejectedValue(new NoAccessError("No encontrado"));
    const res = await GET(req());
    expect(clearSessionCookie).toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });
  it("keeps a valid cookie and goes to /", async () => {
    vi.mocked(getSessionToken).mockResolvedValue("tok");
    vi.mocked(adminApi.me).mockResolvedValue({ id: "1", email: "su@rollo.test", name: "J", appRole: "superadmin" });
    const res = await GET(req());
    expect(clearSessionCookie).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });
  it("rethrows other errors", async () => {
    vi.mocked(getSessionToken).mockResolvedValue("tok");
    vi.mocked(adminApi.me).mockRejectedValue(new ApiError(500, "Error interno"));
    await expect(GET(req())).rejects.toThrow("Error interno");
    expect(clearSessionCookie).not.toHaveBeenCalled();
  });
});
