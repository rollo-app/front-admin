import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("@/lib/auth", () => ({ requireSession: vi.fn(async () => ({ token: "tok" })) }));
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<typeof import("@/lib/api")>()), adminApi: { trips: vi.fn() } }));
import { ApiError, adminApi } from "@/lib/api";
import RollosPage from "./page";

const item = {
  id: "t1", name: "Playa", joinCode: "ABC123", createdAt: 1, startsAt: 1, endsAt: 2, revealAt: 3, revealed: false,
  stage: "active" as const, creator: null, activeMembers: 3, maxMembers: 10, mediaCount: 4,
};
const run = async (sp: Record<string, string | undefined>) => render(await RollosPage({ searchParams: Promise.resolve(sp) }));

beforeEach(() => vi.clearAllMocks());

describe("RollosPage", () => {
  it("forwards page params to the backend with createdAt desc by default", async () => {
    vi.mocked(adminApi.trips).mockResolvedValue({ items: [item], page: 1, pageSize: 25, total: 1 });
    await run({});
    const q = vi.mocked(adminApi.trips).mock.calls[0][1];
    expect(Object.fromEntries(q)).toEqual({ page: "1", pageSize: "25", order: "desc", sort: "createdAt" });
    expect(screen.getByRole("heading", { name: "Rollos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Playa" })).toHaveAttribute("href", "/rollos/t1");
    expect(screen.getByPlaceholderText("Buscar por nombre o código")).toBeInTheDocument();
  });
  it("passes q, sort, order, page and pageSize from the URL", async () => {
    vi.mocked(adminApi.trips).mockResolvedValue({ items: [], page: 2, pageSize: 50, total: 0 });
    await run({ q: "pla", sort: "activeMembers", order: "asc", page: "2", pageSize: "50" });
    expect(Object.fromEntries(vi.mocked(adminApi.trips).mock.calls[0][1])).toEqual({
      page: "2", pageSize: "50", order: "asc", sort: "activeMembers", q: "pla",
    });
    expect(screen.getByText("No hay rollos que coincidan")).toBeInTheDocument();
  });
  it("shows the error state when the backend fails", async () => {
    vi.mocked(adminApi.trips).mockRejectedValue(new ApiError(503, "En mantenimiento"));
    await run({});
    expect(screen.getByRole("alert")).toHaveTextContent("En mantenimiento");
  });
});
