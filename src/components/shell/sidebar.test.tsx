import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/login/actions", () => ({ logout: vi.fn() }));
import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  it("marks the current section, disables the coming-soon ones and shows the email", () => {
    render(<Sidebar email="su@rollo.test" currentPath="/users" />);
    expect(screen.getByRole("link", { name: "Usuarios" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Rollos").closest("a, button, span")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByText("próximamente")).toHaveLength(3);
    expect(screen.getByText("su@rollo.test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salir" })).toBeInTheDocument();
  });
});
