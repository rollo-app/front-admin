import { describe, expect, it } from "vitest";
import { formatBytes, formatInt, formatPct, formatUtcDay, relativeMinutes } from "./format";
describe("format", () => {
  it("formats numbers the Argentine way", () => {
    expect(formatInt(1284)).toBe("1.284");
    expect(formatBytes(2_100_000_000)).toBe("2,1 GB");
    expect(formatBytes(5_000_000)).toBe("5 MB");
    expect(relativeMinutes(0, 3 * 60_000)).toBe("hace 3 min");
    expect(relativeMinutes(0, 2 * 3_600_000)).toBe("hace 2 h");
    expect(formatUtcDay("2026-10-27")).toBe("27/10 (UTC)");
  });
  it("formats percentages as integers", () => {
    expect(formatPct(3_900_000, 5_000_000)).toBe("78");
    expect(formatPct(1, 3)).toBe("33");
    expect(formatPct(5, 0)).toBe("0");
  });
});
