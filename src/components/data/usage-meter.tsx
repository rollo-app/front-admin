import { formatInt, formatPct } from "@/lib/format";

type Level = "ok" | "warn" | "danger";

const BAR: Record<Level, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  danger: "bg-destructive",
};

function levelFor(value: number, limit: number): Level {
  const ratio = limit > 0 ? value / limit : 0;
  if (ratio > 0.85) return "danger";
  if (ratio >= 0.6) return "warn";
  return "ok";
}

export function UsageMeter({
  label,
  value,
  limit,
  format = formatInt,
}: {
  label: string;
  value: number;
  limit: number;
  format?: (n: number) => string;
}) {
  const level = levelFor(value, limit);
  const pct = formatPct(value, limit);
  const width = Math.min(100, Math.max(0, Number(pct)));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={limit}
      data-level={level}
      className="flex flex-col gap-1.5 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
    >
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${BAR[level]}`} style={{ width: `${width}%` }} />
      </div>
      <div className="text-xs tabular-nums text-muted-foreground">
        {format(value)} / {format(limit)}
      </div>
    </div>
  );
}

UsageMeter.Empty = function UsageMeterEmpty({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">Sin datos de Cloudflare</span>
    </div>
  );
};
