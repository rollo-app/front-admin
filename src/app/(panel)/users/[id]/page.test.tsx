import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireSession: vi.fn(async () => ({ token: "tok" })) }));
vi.mock("./user-profile", () => ({ UserProfile: () => null }));
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<typeof import("@/lib/api")>()), adminApi: { user: vi.fn() } }));
import { adminApi } from "@/lib/api";
import type { AdminUserDetail } from "@/lib/types";
import UserDetailPage from "./page";

describe("UserDetailPage rollos card", () => {
  it("links each rollo name to its detail page", async () => {
    vi.mocked(adminApi.user).mockResolvedValue({
      id: "u1", email: "a@b.c", name: "Ana", createdAt: 1, lastSeenAt: null,
      trips: [{ id: "t1", name: "Playa", role: "admin", state: "open" }],
    } as unknown as AdminUserDetail);
    render(await UserDetailPage({ params: Promise.resolve({ id: "u1" }) }));
    expect(screen.getByRole("link", { name: "Playa" })).toHaveAttribute("href", "/rollos/t1");
  });
});
