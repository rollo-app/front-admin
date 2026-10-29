import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("./actions", () => ({ updateUser: vi.fn() }));
import { updateUser } from "./actions";
import { EditUserForm } from "./edit-user-form";
import type { AdminUserDetail } from "@/lib/types";

const user: AdminUserDetail = {
  id: "u1", email: "a@rollo.test", name: "Ana", username: "ana", appRole: "user", badge: null,
  createdAt: 1, lastSeenAt: null, tripCount: 0, mediaCount: 0, trips: [], bio: "Hola", unlimitedRollos: false,
};

beforeEach(() => vi.clearAllMocks());

describe("EditUserForm", () => {
  it("renders the current values and disables Guardar until a change", async () => {
    render(<EditUserForm user={user} />);
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    expect(screen.getByLabelText("Username")).toHaveValue("ana");
    expect(screen.getByLabelText("Descripción")).toHaveValue("Hola");
    expect(screen.getByLabelText("Badge")).toHaveValue("");
    expect(screen.getByLabelText("Rollos ilimitados")).not.toBeChecked();
    expect(screen.getByText("4/150")).toBeInTheDocument();
    const save = screen.getByRole("button", { name: "Guardar" });
    expect(save).toBeDisabled();
    await userEvent.setup().type(screen.getByLabelText("Nombre"), "x");
    expect(save).toBeEnabled();
  });

  it("sends only the changed keys and shows Guardado", async () => {
    const u = userEvent.setup();
    const saved = { ...user, name: "Bea", badge: "founder" as const, unlimitedRollos: true };
    vi.mocked(updateUser).mockResolvedValue({ ok: true, user: saved });
    render(<EditUserForm user={user} />);
    await u.clear(screen.getByLabelText("Nombre"));
    await u.type(screen.getByLabelText("Nombre"), "Bea");
    await u.selectOptions(screen.getByLabelText("Badge"), "founder");
    await u.click(screen.getByLabelText("Rollos ilimitados"));
    await u.click(screen.getByRole("button", { name: "Guardar" }));
    expect(updateUser).toHaveBeenCalledWith("u1", { name: "Bea", badge: "founder", unlimitedRollos: true });
    expect(await screen.findByRole("status")).toHaveTextContent("Guardado");
  });

  it("shows the backend error with role=alert", async () => {
    const u = userEvent.setup();
    vi.mocked(updateUser).mockResolvedValue({ ok: false, error: "Ese nombre de usuario ya está en uso" });
    render(<EditUserForm user={user} />);
    await u.type(screen.getByLabelText("Username"), "2");
    await u.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Ese nombre de usuario ya está en uso");
  });

  it("clears the description with an empty string", async () => {
    const u = userEvent.setup();
    vi.mocked(updateUser).mockResolvedValue({ ok: true, user: { ...user, bio: null } });
    render(<EditUserForm user={user} />);
    await u.clear(screen.getByLabelText("Descripción"));
    await u.click(screen.getByRole("button", { name: "Guardar" }));
    expect(updateUser).toHaveBeenCalledWith("u1", { bio: "" });
  });

  it("does not send an unchanged username, even @-prefixed or uppercase", async () => {
    const u = userEvent.setup();
    vi.mocked(updateUser).mockResolvedValue({ ok: true, user });
    render(<EditUserForm user={user} />);
    const input = screen.getByLabelText("Username");
    await u.clear(input);
    await u.type(input, "@ANA");
    await u.type(screen.getByLabelText("Nombre"), "!");
    await u.click(screen.getByRole("button", { name: "Guardar" }));
    expect(updateUser).toHaveBeenCalledWith("u1", { name: "Ana!" });
  });

  it("does not count a whitespace-only name change", async () => {
    render(<EditUserForm user={user} />);
    await userEvent.setup().type(screen.getByLabelText("Nombre"), "  ");
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });

  it("links a username error to the field", async () => {
    const u = userEvent.setup();
    vi.mocked(updateUser).mockResolvedValue({ ok: false, error: "Ese nombre de usuario ya está en uso.", field: "username" });
    render(<EditUserForm user={user} />);
    await u.type(screen.getByLabelText("Username"), "2");
    await u.click(screen.getByRole("button", { name: "Guardar" }));
    const input = screen.getByLabelText("Username");
    expect(await screen.findByRole("alert")).toHaveTextContent("ya está en uso");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain("edit-username-error");
  });
});
