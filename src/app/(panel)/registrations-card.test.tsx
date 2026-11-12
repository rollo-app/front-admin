import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("./dashboard.actions", () => ({ setRegistrationsOpen: vi.fn() }));
import { setRegistrationsOpen } from "./dashboard.actions";
import { RegistrationsCard } from "./registrations-card";

const open = { open: true, updatedAt: null, updatedBy: null };
const closed = { open: false, updatedAt: Date.UTC(2026, 9, 28, 15, 5), updatedBy: { id: "1", email: "su@rollo.test" } };
beforeEach(() => vi.clearAllMocks());

describe("RegistrationsCard", () => {
  it("shows the state, the propagation note and who changed it", () => {
    render(<RegistrationsCard state={closed} />);
    expect(screen.getByText("Registros cerrados")).toBeInTheDocument();
    expect(screen.getByText(/hasta 1 minuto/)).toBeInTheDocument();
    expect(screen.getByText("cambiado por su@rollo.test el 28/10/2026 12:05")).toBeInTheDocument();
  });
  it("renders nothing about the author when updatedBy is null", () => {
    render(<RegistrationsCard state={{ open: true, updatedAt: 1, updatedBy: null }} />);
    expect(screen.queryByText(/cambiado/)).not.toBeInTheDocument();
  });
  it("shows no author line when never changed", () => {
    render(<RegistrationsCard state={open} />);
    expect(screen.getByText("Registros abiertos")).toBeInTheDocument();
    expect(screen.queryByText(/cambiado/)).not.toBeInTheDocument();
  });
  it("asks for confirmation before closing", async () => {
    vi.mocked(setRegistrationsOpen).mockResolvedValue({ ok: true, state: closed });
    render(<RegistrationsCard state={open} />);
    await userEvent.click(screen.getByRole("button", { name: "Cerrar registros" }));
    expect(setRegistrationsOpen).not.toHaveBeenCalled();
    expect(screen.getByText("Cerrar registros: nadie va a poder crear una cuenta nueva. ¿Seguro?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sí, cerrar" }));
    expect(setRegistrationsOpen).toHaveBeenCalledWith(false);
    await vi.waitFor(() => expect(refresh).toHaveBeenCalled());
  });
  it("cancelling does not call the action", async () => {
    render(<RegistrationsCard state={open} />);
    await userEvent.click(screen.getByRole("button", { name: "Cerrar registros" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(setRegistrationsOpen).not.toHaveBeenCalled();
  });
  it("reopens with a confirmation too", async () => {
    vi.mocked(setRegistrationsOpen).mockResolvedValue({ ok: true, state: open });
    render(<RegistrationsCard state={closed} />);
    await userEvent.click(screen.getByRole("button", { name: "Abrir registros" }));
    await userEvent.click(screen.getByRole("button", { name: "Sí, abrir" }));
    expect(setRegistrationsOpen).toHaveBeenCalledWith(true);
  });
  it("shows the backend error", async () => {
    vi.mocked(setRegistrationsOpen).mockResolvedValue({ ok: false, error: "No encontrado" });
    render(<RegistrationsCard state={open} />);
    await userEvent.click(screen.getByRole("button", { name: "Cerrar registros" }));
    await userEvent.click(screen.getByRole("button", { name: "Sí, cerrar" }));
    expect(await screen.findByText("No encontrado")).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });
});
