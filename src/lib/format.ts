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

/** epoch ms -> "dd/mm/yyyy hh:mm" (UTC-3). */
export function formatDateTime(ms: number): string {
  const d = new Date(ms - 3 * 3600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${formatDate(ms)} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
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

/** value/limit -> integer percent as string ("78"); 0 when limit <= 0. */
export function formatPct(value: number, limit: number): string {
  if (limit <= 0) return "0";
  return String(Math.round((value / limit) * 100));
}

const gbFmt = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 2_100_000_000 -> "2,1 GB"; below 1 GB -> "5 MB" (decimal units). */
export function formatBytes(n: number): string {
  if (n >= 1e9) return `${gbFmt.format(n / 1e9)} GB`;
  return `${formatInt(n / 1e6)} MB`;
}

/** "2026-10-27" -> "27/10 (UTC)" */
export function formatUtcDay(day: string): string {
  return `${formatDayMonth(day)} (UTC)`;
}

/** "2026-10-27" -> "27/10" */
export function formatDayMonth(day: string): string {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
}
