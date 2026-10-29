import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DegradedNote } from "./degraded-note";

describe("DegradedNote", () => {
  it("shows ADMIN_TOKEN when there is no updatedBy", () => {
    render(<DegradedNote state={{ on: true, updatedAt: Date.UTC(2026, 9, 28, 15, 5), updatedBy: null }} />);
    expect(screen.getByText("cambiado con ADMIN_TOKEN el 28/10/2026 12:05")).toBeInTheDocument();
  });
  it("shows who changed it", () => {
    render(<DegradedNote state={{ on: true, updatedAt: Date.UTC(2026, 9, 28, 15, 5), updatedBy: { id: "1", email: "su@rollo.test" } }} />);
    expect(screen.getByText(/cambiado por su@rollo.test/)).toBeInTheDocument();
  });
  it("renders nothing when never changed", () => {
    const { container } = render(<DegradedNote state={{ on: false, updatedAt: null, updatedBy: null }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
