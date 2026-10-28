import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { ChartCard } from "./chart-card";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("ChartCard", () => {
  it("renders the title and legend labels", () => {
    render(
      <ChartCard
        title="Actividad"
        series={[{ day: "2026-10-27", values: { a: 1, b: 2 } }]}
        keys={[
          { key: "a", label: "Altas", color: "var(--chart-1)" },
          { key: "b", label: "Bajas", color: "var(--chart-2)" },
        ]}
      />,
    );
    expect(screen.getByText("Actividad")).toBeInTheDocument();
    expect(screen.getByText("Altas")).toBeInTheDocument();
    expect(screen.getByText("Bajas")).toBeInTheDocument();
  });
});
