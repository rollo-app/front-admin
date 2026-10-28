import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("./actions", () => ({
  startLogin: vi.fn(async (_p: unknown, f: FormData) => ({ step: "code", email: String(f.get("email")) })),
  verifyLogin: vi.fn(async (p: { email?: string }) => ({ step: "code", email: p.email })),
}));
import { verifyLogin } from "./actions";
import { LoginForm } from "./login-form";

beforeEach(() => vi.clearAllMocks());

describe("LoginForm", () => {
  it("verifies against the new email after Usar otro email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Email"), "a@rollo.test");
    await user.click(screen.getByRole("button", { name: "Mandame el código" }));
    expect(await screen.findByText("Te mandamos un código a a@rollo.test")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Usar otro email" }));
    const input = screen.getByLabelText("Email");
    await user.clear(input);
    await user.type(input, "b@rollo.test");
    await user.click(screen.getByRole("button", { name: "Mandame el código" }));
    expect(await screen.findByText("Te mandamos un código a b@rollo.test")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Código"), "ABC234");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(verifyLogin).toHaveBeenCalledWith(expect.objectContaining({ email: "b@rollo.test" }), expect.any(FormData));
  });
});
