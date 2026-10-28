import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsageMeter } from "./usage-meter";

describe("UsageMeter", () => {
  it.each([[41_200, "ok"], [78_000, "warn"], [90_000, "danger"]])("colors %i of 100k as %s", (value, level) => {
    render(<UsageMeter label="Requests" value={value} limit={100_000} />);
    expect(screen.getByRole("meter")).toHaveAttribute("data-level", level);
  });
  it("shows value, limit and percent", () => {
    render(<UsageMeter label="D1 lecturas" value={3_900_000} limit={5_000_000} />);
    expect(screen.getByText("3.900.000 / 5.000.000")).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();
  });
  it("uses a custom formatter", () => {
    render(<UsageMeter label="R2" value={1_000} limit={2_000} format={(n) => `${n} B`} />);
    expect(screen.getByText("1000 B / 2000 B")).toBeInTheDocument();
  });
  it("renders the empty state", () => {
    render(<UsageMeter.Empty label="Requests" />);
    expect(screen.getByText("Sin datos de Cloudflare")).toBeInTheDocument();
  });
});
