import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("./dashboard.actions", () => ({ setDegradedMode: vi.fn() }));
import { setDegradedMode } from "./dashboard.actions";
import { DegradedSwitch } from "./degraded-switch";

beforeEach(() => vi.clearAllMocks());

describe("DegradedSwitch", () => {
  it("asks for confirmation before activating", async () => {
    vi.mocked(setDegradedMode).mockResolvedValue({ ok: true, state: { on: true, updatedAt: 1, updatedBy: { id: "1", email: "su@rollo.test" } } });
    render(<DegradedSwitch state={{ on: false, updatedAt: null, updatedBy: null }} />);
    await userEvent.click(screen.getByRole("button", { name: "Activar" }));
    expect(setDegradedMode).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Sí, activar" }));
    expect(setDegradedMode).toHaveBeenCalledWith(true);
  });
  it("shows the current state in a pill", () => {
    render(<DegradedSwitch state={{ on: true, updatedAt: 1, updatedBy: null }} />);
    expect(screen.getByText("Modo degradado: activo")).toBeInTheDocument();
  });
  it("shows the backend error", async () => {
    vi.mocked(setDegradedMode).mockResolvedValue({ ok: false, error: "No encontrado" });
    render(<DegradedSwitch state={{ on: true, updatedAt: 1, updatedBy: { id: "1", email: "su@rollo.test" } }} />);
    await userEvent.click(screen.getByRole("button", { name: "Desactivar" }));
    await userEvent.click(screen.getByRole("button", { name: "Sí, desactivar" }));
    expect(await screen.findByText("No encontrado")).toBeInTheDocument();
  });
});
