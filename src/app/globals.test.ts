// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("theme tokens", () => {
  it("defines the Rollo palette for light and dark", () => {
    expect(css).toMatch(/--primary:\s*#3155F5/i);
    expect(css).toMatch(/--background:\s*#F2F2F7/i);
    expect(css).toMatch(/prefers-color-scheme:\s*dark/);
    expect(css).toMatch(/--primary:\s*#5C7CFF/i);
    expect(css).toMatch(/--radius:\s*14px/);
  });
});
