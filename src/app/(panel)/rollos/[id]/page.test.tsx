import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
vi.mock("@/lib/auth", () => ({ requireSession: vi.fn(async () => ({ token: "tok" })) }));
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("./cap-form", () => ({ CapForm: () => null }));
vi.mock("./originals-form", () => ({ OriginalsForm: () => null }));
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<typeof import("@/lib/api")>()), adminApi: { trip: vi.fn() } }));
import { adminApi } from "@/lib/api";
import TripDetailPage from "./page";

const base = {
  id: "t1", name: "Casamiento", joinCode: "ABC123", createdAt: 1, startsAt: 1, endsAt: 2, revealAt: 3, revealed: false,
  stage: "active" as const, creator: null, activeMembers: 3, maxMembers: 10, mediaCount: 4, keepOriginals: false,
  originalsExpireAt: null, originalsPurgedAt: null, members: [],
};
const run = async () => render(await TripDetailPage({ params: Promise.resolve({ id: "t1" }) }));

beforeEach(() => vi.clearAllMocks());

describe("TripDetailPage", () => {
  it("shows the type and a groups table for an event", async () => {
    vi.mocked(adminApi.trip).mockResolvedValue({
      ...base, type: "event",
      groups: [
        { id: "g1", name: "Familia", memberCount: 1200, mediaCount: 34 },
        { id: "g2", name: "Amigos", memberCount: 5, mediaCount: 0 },
      ],
    });
    await run();
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByText("Evento")).toBeInTheDocument();
    const card = screen.getByText("Grupos").closest("[data-slot=card]") as HTMLElement;
    expect(within(card).getByRole("columnheader", { name: "Personas" })).toBeInTheDocument();
    const familia = within(card).getByRole("row", { name: /Familia/ });
    expect(familia).toHaveTextContent("1.200");
    expect(familia).toHaveTextContent("34");
    expect(within(card).getByRole("row", { name: /Amigos/ })).toHaveTextContent("5");
  });
  it("shows a muted line when an event has no groups", async () => {
    vi.mocked(adminApi.trip).mockResolvedValue({ ...base, type: "event", groups: [] });
    await run();
    expect(screen.getByText("Todavía no hay grupos.")).toBeInTheDocument();
  });
  it("shows no groups card for a regular trip", async () => {
    vi.mocked(adminApi.trip).mockResolvedValue({ ...base, type: "trip", groups: [] });
    await run();
    expect(screen.getByText("Rollo")).toBeInTheDocument();
    expect(screen.queryByText("Grupos")).not.toBeInTheDocument();
  });
});
