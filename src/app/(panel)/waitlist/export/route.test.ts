import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/session", () => ({ getSessionToken: vi.fn() }));
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<typeof import("@/lib/api")>()), adminApi: { waitlistCsv: vi.fn() } }));
import { ApiError, NoAccessError, adminApi } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSessionToken).mockResolvedValue("tok");
});

describe("GET /waitlist/export", () => {
  it("uses the cookie token and streams body with content-type and disposition", async () => {
    vi.mocked(adminApi.waitlistCsv).mockResolvedValue(
      new Response("email\nana@example.com\n", {
        headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="waitlist.csv"' },
      }),
    );
    const res = await GET();
    expect(adminApi.waitlistCsv).toHaveBeenCalledWith("tok");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="waitlist.csv"');
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.text()).toBe("email\nana@example.com\n");
  });
  it("falls back to sensible headers when the backend omits them", async () => {
    vi.mocked(adminApi.waitlistCsv).mockResolvedValue(new Response(new TextEncoder().encode("email\n")));
    const res = await GET();
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toContain("attachment");
  });
  it("answers 404 without calling the backend when there is no cookie", async () => {
    vi.mocked(getSessionToken).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(404);
    expect(adminApi.waitlistCsv).not.toHaveBeenCalled();
  });
  it("answers 404 when the backend hides the route", async () => {
    vi.mocked(adminApi.waitlistCsv).mockRejectedValue(new NoAccessError("No encontrado"));
    expect((await GET()).status).toBe(404);
  });
  it("passes other backend errors through as their status", async () => {
    vi.mocked(adminApi.waitlistCsv).mockRejectedValue(new ApiError(503, "En mantenimiento"));
    const res = await GET();
    expect(res.status).toBe(503);
  });
});
