export const PAGE_SIZES = [25, 50, 100] as const;

export type PageParams = { page: number; pageSize: number; sort?: string; order: "asc" | "desc"; q?: string };
type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parsePageParams(sp: SearchParams, defaults: { sort?: string } = {}): PageParams {
  const page = Math.max(1, Math.floor(Number(first(sp.page))) || 1);
  const rawSize = Number(first(sp.pageSize));
  const pageSize = (PAGE_SIZES as readonly number[]).includes(rawSize) ? rawSize : 25;
  const sort = first(sp.sort)?.trim() || defaults.sort;
  const order = first(sp.order) === "asc" ? "asc" : "desc";
  const q = first(sp.q)?.trim() || undefined;
  const out: PageParams = { page, pageSize, order };
  if (sort) out.sort = sort;
  if (q) out.q = q;
  return out;
}

/** Changing q, sort, order or pageSize resets page to 1; every other key is kept. */
export function buildPageHref(pathname: string, current: PageParams, patch: Partial<PageParams>): string {
  const resets = ["q", "sort", "order", "pageSize"].some((k) => k in patch);
  const next: PageParams = { ...current, ...patch };
  if (resets && !("page" in patch)) next.page = 1;
  const qs = new URLSearchParams();
  qs.set("page", String(next.page));
  qs.set("pageSize", String(next.pageSize));
  if (next.sort) qs.set("sort", next.sort);
  qs.set("order", next.order);
  if (next.q) qs.set("q", next.q);
  return `${pathname}?${qs}`;
}

/** Query for the backend list endpoints. */
export function toBackendQuery(p: PageParams): URLSearchParams {
  const qs = new URLSearchParams({ page: String(p.page), pageSize: String(p.pageSize), order: p.order });
  if (p.sort) qs.set("sort", p.sort);
  if (p.q) qs.set("q", p.q);
  return qs;
}
