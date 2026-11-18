import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("./login-form", () => ({ LoginForm: () => null }));
import LoginPage from "./page";

describe("LoginPage", () => {
  it("titles the card with the Rollo Project brand", () => {
    render(<LoginPage />);
    expect(screen.getByText("Rollo Project · Panel")).toBeInTheDocument();
  });
});
