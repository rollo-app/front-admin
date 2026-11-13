import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { tripColumns } from "./columns";
import type { AdminTrip } from "@/lib/types";

const base: AdminTrip = {
  id: "t1", name: "Playa", joinCode: "ABC123", createdAt: Date.UTC(2026, 9, 27, 15), startsAt: 1, endsAt: 2, revealAt: 3,
  revealed: false, stage: "active", creator: { id: "u1", name: "Ana", username: "ana" },
  activeMembers: 12, maxMembers: 15, mediaCount: 1284,
  keepOriginals: false, originalsExpireAt: null, originalsPurgedAt: null,
};
const cell = (header: string, t: AdminTrip = base) => {
  const col = tripColumns.find((c) => c.header === header)!;
  render(<div data-testid="c">{col.cell ? col.cell(t) : String(t[col.accessorKey!])}</div>);
  return screen.getByTestId("c");
};

describe("trip columns", () => {
  it("shows participants as 'N de M' and sorts by activeMembers", () => {
    expect(cell("Participantes")).toHaveTextContent("12 de 15");
    expect(tripColumns.find((c) => c.header === "Participantes")!.meta?.sortKey).toBe("activeMembers");
  });
  it("sorts by name, photos and createdAt", () => {
    const key = (h: string) => tripColumns.find((c) => c.header === h)!.meta?.sortKey;
    expect([key("Nombre"), key("Fotos"), key("Creado")]).toEqual(["name", "mediaCount", "createdAt"]);
  });
  it("formats photos", () => expect(cell("Fotos")).toHaveTextContent("1.284"));
  it("formats the creation date", () => expect(cell("Creado")).toHaveTextContent("27/10/2026"));
  it.each([
    ["upcoming", "Por empezar"], ["active", "En curso"], ["ended", "Terminado"], ["revealed", "Revelado"],
  ] as const)("labels stage %s as %s", (stage, label) => {
    expect(cell("Etapa", { ...base, stage })).toHaveTextContent(label);
  });
  it("links the creator to the user detail page", () => {
    cell("Creador");
    const link = screen.getByRole("link", { name: /Ana/ });
    expect(link).toHaveAttribute("href", "/users/u1");
    expect(link).toHaveTextContent("@ana");
  });
  it("shows a dash without creator", () => {
    expect(cell("Creador", { ...base, creator: null })).toHaveTextContent("—");
  });
  it("shows the join code", () => expect(cell("Código")).toHaveTextContent("ABC123"));
});
