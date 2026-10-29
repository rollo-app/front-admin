import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./stat-card";

describe("StatCard", () => {
  it("pads the content like the other cards", () => {
    render(<StatCard label="Usuarios" value={1287} hint="+27 esta semana" />);
    expect(screen.getByText("Usuarios").parentElement?.className).toContain("px-(--card-spacing)");
    expect(screen.getByText("1.287")).toBeInTheDocument();
  });
});
