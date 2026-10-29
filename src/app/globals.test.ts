// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("theme tokens", () => {
  it("defines the Rollo palette for light and dark", () => {
    expect(css).toMatch(/--primary:\s*#3155F5/i);
    expect(css).toMatch(/--background:\s*#F2F2F7/i);
    expect(css).toMatch(/prefers-color-scheme:\s*dark/);
    expect(css).toMatch(/--primary:\s*#3D5EFA/i);
    expect(css).toMatch(/--radius:\s*14px/);
  });
  it("defines the dark border and the accessible text tokens", () => {
    const [light, dark] = css.split(/@media \(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{/);
    expect(dark).toMatch(/--border:\s*#38383A/i);
    expect(light).toMatch(/--border:\s*#3C3C434A/i);
    const tokens: [string, string, string][] = [
      ["success-text", "#248A3D", "#30D158"],
      ["warning-text", "#B25000", "#FF9F0A"],
      ["destructive-text", "#D70015", "#FF453A"],
      ["primary-text", "#3155F5", "#8AA0FF"],
    ];
    for (const [name, l, d] of tokens) {
      expect(light).toMatch(new RegExp(`--${name}:\\s*${l}`, "i"));
      expect(dark).toMatch(new RegExp(`--${name}:\\s*${d}`, "i"));
      expect(css).toContain(`--color-${name}: var(--${name})`);
    }
  });
});
