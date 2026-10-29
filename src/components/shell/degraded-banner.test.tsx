import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const path = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => path.current }));
import { DegradedBanner } from "./degraded-banner";

beforeEach(() => {
  path.current = "/";
});

describe("DegradedBanner", () => {
  it("shows the warning with role status when degraded mode is on", () => {
    render(<DegradedBanner on />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Modo degradado activo: no se pueden subir fotos, crear rollos ni registrarse.",
    );
    expect(screen.queryByRole("link", { name: "Ir al dashboard" })).not.toBeInTheDocument();
  });
  it("links to the dashboard from other pages", () => {
    path.current = "/users";
    render(<DegradedBanner on />);
    expect(screen.getByRole("link", { name: "Ir al dashboard" })).toHaveAttribute("href", "/");
  });
  it("renders nothing when off", () => {
    const { container } = render(<DegradedBanner on={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
