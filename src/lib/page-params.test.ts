import { describe, expect, it } from "vitest";
import { buildPageHref, parsePageParams, toBackendQuery } from "./page-params";

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
  it("parses, keeps and forwards the filters it was told about", () => {
    const p = parsePageParams({ status: "pending", other: "x" }, { filters: ["status"] });
    expect(p).toEqual({ page: 1, pageSize: 25, order: "desc", filters: { status: "pending" } });
    expect(parsePageParams({ status: "pending" })).toEqual({ page: 1, pageSize: 25, order: "desc" });
    expect(buildPageHref("/waitlist", { ...p, page: 3 }, { page: 4 })).toBe("/waitlist?page=4&pageSize=25&order=desc&status=pending");
    expect(buildPageHref("/waitlist", { ...p, page: 3 }, { filters: {} })).toBe("/waitlist?page=1&pageSize=25&order=desc");
    expect(buildPageHref("/waitlist", { ...p, page: 3 }, { filters: { status: "confirmed" } })).toBe("/waitlist?page=1&pageSize=25&order=desc&status=confirmed");
    expect(Object.fromEntries(toBackendQuery(p))).toEqual({ page: "1", pageSize: "25", order: "desc", status: "pending" });
  });
});
