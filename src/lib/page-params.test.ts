import { describe, expect, it } from "vitest";
import { buildPageHref, parsePageParams } from "./page-params";

describe("page params", () => {
  it("parses with defaults and clamps page size to the allowed set", () => {
    expect(parsePageParams({})).toEqual({ page: 1, pageSize: 25, order: "desc" });
    expect(parsePageParams({ page: "3", pageSize: "40", q: " ana ", sort: "name", order: "asc" })).toEqual({ page: 3, pageSize: 25, q: "ana", sort: "name", order: "asc" });
  });
  it("keeps the other params and resets page on q, sort or pageSize changes", () => {
    const cur = { page: 3, pageSize: 50, order: "desc" as const, q: "ana", sort: "createdAt" };
    expect(buildPageHref("/users", cur, { page: 4 })).toBe("/users?page=4&pageSize=50&sort=createdAt&order=desc&q=ana");
    expect(buildPageHref("/users", cur, { q: "beto" })).toBe("/users?page=1&pageSize=50&sort=createdAt&order=desc&q=beto");
    expect(buildPageHref("/users", cur, { sort: "name", order: "asc" })).toBe("/users?page=1&pageSize=50&sort=name&order=asc&q=ana");
  });
});
