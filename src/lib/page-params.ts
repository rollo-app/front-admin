export const PAGE_SIZES = [25, 50, 100] as const;

export type PageParams = { page: number; pageSize: number; sort?: string; order: "asc" | "desc"; q?: string; filters?: Record<string, string> };
type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parsePageParams(sp: SearchParams, defaults: { sort?: string; filters?: string[] } = {}): PageParams {
  const page = Math.max(1, Math.floor(Number(first(sp.page))) || 1);
  const rawSize = Number(first(sp.pageSize));
  const pageSize = (PAGE_SIZES as readonly number[]).includes(rawSize) ? rawSize : 25;
  const sort = first(sp.sort)?.trim() || defaults.sort;
  const order = first(sp.order) === "asc" ? "asc" : "desc";
  const q = first(sp.q)?.trim() || undefined;
  const out: PageParams = { page, pageSize, order };
  if (sort) out.sort = sort;
  if (q) out.q = q;
  const filters: Record<string, string> = {};
  for (const key of defaults.filters ?? []) {
    const v = first(sp[key])?.trim();
    if (v) filters[key] = v;
  }
  if (Object.keys(filters).length) out.filters = filters;
  return out;
}

/** Changing q, sort, order or pageSize resets page to 1; every other key is kept. */
export function buildPageHref(pathname: string, current: PageParams, patch: Partial<PageParams>): string {
  const resets = ["q", "sort", "order", "pageSize", "filters"].some((k) => k in patch);
  const next: PageParams = { ...current, ...patch };
  if (resets && !("page" in patch)) next.page = 1;
  const qs = new URLSearchParams();
  qs.set("page", String(next.page));
  qs.set("pageSize", String(next.pageSize));
  if (next.sort) qs.set("sort", next.sort);
  qs.set("order", next.order);
  if (next.q) qs.set("q", next.q);
  for (const [k, v] of Object.entries(next.filters ?? {})) qs.set(k, v);
  return `${pathname}?${qs}`;
}

/** Query for the backend list endpoints. */
export function toBackendQuery(p: PageParams): URLSearchParams {
  const qs = new URLSearchParams({ page: String(p.page), pageSize: String(p.pageSize), order: p.order });
  if (p.sort) qs.set("sort", p.sort);
  if (p.q) qs.set("q", p.q);
  for (const [k, v] of Object.entries(p.filters ?? {})) qs.set(k, v);
  return qs;
}
