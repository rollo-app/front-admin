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
  it("shows ADMIN_TOKEN when there is no updatedBy", () => {
    render(<DegradedSwitch state={{ on: true, updatedAt: Date.UTC(2026, 9, 28, 15, 5), updatedBy: null }} />);
    expect(screen.getByText("cambiado con ADMIN_TOKEN el 28/10/2026 12:05")).toBeInTheDocument();
  });
  it("shows the backend error", async () => {
    vi.mocked(setDegradedMode).mockResolvedValue({ ok: false, error: "No encontrado" });
    render(<DegradedSwitch state={{ on: true, updatedAt: 1, updatedBy: { id: "1", email: "su@rollo.test" } }} />);
    expect(screen.getByText(/cambiado por su@rollo.test/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Desactivar" }));
    await userEvent.click(screen.getByRole("button", { name: "Sí, desactivar" }));
    expect(await screen.findByText("No encontrado")).toBeInTheDocument();
  });
});
