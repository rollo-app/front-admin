import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
const refresh = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("./actions", () => ({ updateTripOriginals: vi.fn() }));
import { updateTripOriginals } from "./actions";
import { OriginalsForm } from "./originals-form";
import { formatDate } from "@/lib/format";
import type { AdminTripDetail } from "@/lib/types";

beforeEach(() => vi.clearAllMocks());
const EXPIRE = Date.UTC(2026, 11, 20, 15);
const PURGED = Date.UTC(2026, 10, 1, 15);
const renderForm = (p: { keepOriginals: boolean; originalsExpireAt: number | null; originalsPurgedAt: number | null }) =>
  render(<OriginalsForm tripId="t1" {...p} />);

describe("OriginalsForm", () => {
  it("off and not purged: says when originals are deleted", () => {
    renderForm({ keepOriginals: false, originalsExpireAt: EXPIRE, originalsPurgedAt: null });
    expect(screen.getByRole("switch", { name: "Conservar originales" })).not.toBeChecked();
    expect(screen.getByText(`Las originales se borran el ${formatDate(EXPIRE)}`)).toBeInTheDocument();
  });
  it("purged: says they were deleted and that turning on does not recover them", () => {
    renderForm({ keepOriginals: false, originalsExpireAt: EXPIRE, originalsPurgedAt: PURGED });
    expect(screen.getByText(`Las originales se borraron el ${formatDate(PURGED)}. Prender esta opción no las recupera.`)).toBeInTheDocument();
  });
  it("on: says they are kept forever", () => {
    renderForm({ keepOriginals: true, originalsExpireAt: null, originalsPurgedAt: null });
    expect(screen.getByRole("switch", { name: "Conservar originales" })).toBeChecked();
    expect(screen.getByText("Las originales se guardan para siempre.")).toBeInTheDocument();
  });
  it("saves the toggle, shows Guardado and refreshes", async () => {
    vi.mocked(updateTripOriginals).mockResolvedValue({ ok: true, trip: {} as AdminTripDetail });
    renderForm({ keepOriginals: false, originalsExpireAt: EXPIRE, originalsPurgedAt: null });
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
    await userEvent.setup().click(screen.getByRole("switch", { name: "Conservar originales" }));
    await userEvent.setup().click(screen.getByRole("button", { name: "Guardar" }));
    expect(updateTripOriginals).toHaveBeenCalledWith("t1", true);
    expect(await screen.findByRole("status")).toHaveTextContent("Guardado");
    expect(refresh).toHaveBeenCalled();
  });
  it("shows the error inline and does not refresh", async () => {
    vi.mocked(updateTripOriginals).mockResolvedValue({ ok: false, error: "No se pudo guardar, probá de nuevo." });
    renderForm({ keepOriginals: false, originalsExpireAt: EXPIRE, originalsPurgedAt: null });
    await userEvent.setup().click(screen.getByRole("switch", { name: "Conservar originales" }));
    await userEvent.setup().click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo guardar");
    expect(refresh).not.toHaveBeenCalled();
  });
});
