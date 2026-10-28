import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/session", () => ({ clearSessionCookie: vi.fn() }));
import { clearSessionCookie } from "@/lib/session";
import { GET } from "./route";

describe("GET /logout", () => {
  it("clears the cookie and redirects to /login", async () => {
    const res = await GET(new Request("http://localhost:3000/logout"));
    expect(clearSessionCookie).toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });
});
