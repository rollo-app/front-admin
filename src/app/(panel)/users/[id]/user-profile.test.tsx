import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("./actions", () => ({ updateUser: vi.fn() }));
import { updateUser } from "./actions";
import { UserProfile } from "./user-profile";
import type { AdminUserDetail } from "@/lib/types";

const user: AdminUserDetail = {
  id: "u1", email: "a@rollo.test", name: "Ana", username: "ana", appRole: "user", badge: null,
  createdAt: 1, lastSeenAt: null, tripCount: 0, mediaCount: 0, trips: [], bio: null, unlimitedRollos: false,
};
const ui = <UserProfile user={user} lastSeen="nunca" createdAt="1 ene 2026" />;

beforeEach(() => vi.clearAllMocks());

describe("UserProfile", () => {
  it("opens the form focused on Nombre and Cancelar returns focus to Editar", async () => {
    const u = userEvent.setup();
    render(ui);
    await u.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByLabelText("Nombre")).toHaveFocus();
    await u.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByLabelText("Nombre")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toHaveFocus();
  });

  it("shows the saved data and Guardado after a successful save", async () => {
    const u = userEvent.setup();
    vi.mocked(updateUser).mockResolvedValue({ ok: true, user: { ...user, name: "Bea", badge: "founder", unlimitedRollos: true } });
    render(ui);
    await u.click(screen.getByRole("button", { name: "Editar" }));
    await u.clear(screen.getByLabelText("Nombre"));
    await u.type(screen.getByLabelText("Nombre"), "Bea");
    await u.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByText("Founder")).toBeInTheDocument();
    expect(screen.getByText("sí")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Guardado");
    expect(screen.getByRole("button", { name: "Editar" })).toHaveFocus();
  });
});
