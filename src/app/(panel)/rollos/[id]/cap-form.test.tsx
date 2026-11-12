import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
const refresh = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("./actions", () => ({ updateTripCap: vi.fn() }));
import { updateTripCap } from "./actions";
import { CapForm } from "./cap-form";
import type { AdminTripDetail } from "@/lib/types";

beforeEach(() => vi.clearAllMocks());
const renderForm = () => render(<CapForm tripId="t1" activeMembers={4} maxMembers={10} />);

describe("CapForm", () => {
  it("shows the current cap with min = active members and max 1000; Guardar disabled until a change", async () => {
    renderForm();
    const input = screen.getByLabelText("Cupo máximo");
    expect(input).toHaveValue(10);
    expect(input).toHaveAttribute("min", "4");
    expect(input).toHaveAttribute("max", "1000");
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
    await userEvent.setup().type(input, "0");
    expect(screen.getByRole("button", { name: "Guardar" })).toBeEnabled();
  });
  it.each([["3", "al menos 4"], ["1001", "1000"], ["5.5", "entero"], ["", "entero"]])(
    "rejects %s client-side without calling the action",
    async (value, msg) => {
      const u = userEvent.setup();
      renderForm();
      const input = screen.getByLabelText("Cupo máximo");
      await u.clear(input);
      if (value) await u.type(input, value);
      await u.click(screen.getByRole("button", { name: "Guardar" }));
      expect(await screen.findByRole("alert")).toHaveTextContent(msg);
      expect(updateTripCap).not.toHaveBeenCalled();
    },
  );
  it("saves, shows Guardado and refreshes the data", async () => {
    const u = userEvent.setup();
    vi.mocked(updateTripCap).mockResolvedValue({ ok: true, trip: {} as AdminTripDetail });
    renderForm();
    const input = screen.getByLabelText("Cupo máximo");
    await u.clear(input);
    await u.type(input, "20");
    await u.click(screen.getByRole("button", { name: "Guardar" }));
    expect(updateTripCap).toHaveBeenCalledWith("t1", 20);
    expect(await screen.findByRole("status")).toHaveTextContent("Guardado");
    expect(refresh).toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("shows the backend error inline and does not refresh", async () => {
    const u = userEvent.setup();
    vi.mocked(updateTripCap).mockResolvedValue({ ok: false, error: "El cupo no puede ser menor a los participantes activos" });
    renderForm();
    await u.type(screen.getByLabelText("Cupo máximo"), "1");
    await u.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("menor a los participantes activos");
    expect(refresh).not.toHaveBeenCalled();
  });
});
