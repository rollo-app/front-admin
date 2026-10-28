const intFmt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0, useGrouping: "always" });

/** 1284 -> "1.284" */
export function formatInt(n: number): string {
  return intFmt.format(n);
}

/** epoch ms -> "dd/mm/yyyy" (UTC-3, the product's timezone). */
export function formatDate(ms: number): string {
  const d = new Date(ms - 3 * 3600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

/** "hace 3 min" / "hace 2 h" / "hace 5 días" */
export function relativeMinutes(fromMs: number, nowMs = Date.now()): string {
  const min = Math.max(0, Math.floor((nowMs - fromMs) / 60_000));
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}
