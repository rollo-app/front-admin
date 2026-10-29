import { ChartCard } from "@/components/data/chart-card";
import { EmptyState } from "@/components/data/empty-state";
import { ErrorState } from "@/components/data/error-state";
import { StatCard } from "@/components/data/stat-card";
import { UsageMeter } from "@/components/data/usage-meter";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, adminApi } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { formatBytes, formatUtcDay, relativeMinutes } from "@/lib/format";
import type { DegradedMode, Metric, MetricsResponse, UsageMetric, UsageResponse } from "@/lib/types";
import { DegradedNote } from "./degraded-note";
import { DegradedSwitch } from "./degraded-switch";

const USAGE_METERS: { key: UsageMetric; label: string }[] = [
  { key: "workers_requests", label: "Requests" },
  { key: "d1_rows_read", label: "D1 lecturas" },
  { key: "d1_rows_written", label: "D1 escrituras" },
  { key: "r2_class_a", label: "R2 op. A (mes)" },
  { key: "r2_class_b", label: "R2 op. B (mes)" },
];

const CHART_KEYS = [
  { key: "users_new", label: "Usuarios nuevos", color: "var(--chart-1)" },
  { key: "media_new", label: "Fotos subidas", color: "var(--chart-2)" },
  { key: "trips_new", label: "Rollos creados", color: "var(--chart-3)" },
];

const STALE_MS = 20 * 60_000;

function messageOf(reason: unknown): string {
  if (reason instanceof ApiError) return reason.message;
  throw reason;
}

function dayMinus(day: string, n: number): string {
  const [y, mo, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d - n)).toISOString().slice(0, 10);
}

/** Sum over the 7 calendar days ending at latestDay (missed snapshot days don't widen the window). */
function weekSum(m: MetricsResponse, key: Metric): number {
  if (m.latestDay === null) return 0;
  const from = dayMinus(m.latestDay, 6);
  return m.series.filter((p) => p.day >= from && p.day <= m.latestDay!).reduce((acc, p) => acc + (p.values[key] ?? 0), 0);
}

function latest(m: MetricsResponse, key: Metric): number | null {
  if (m.latestDay === null) return null;
  const point = m.series.find((p) => p.day === m.latestDay) ?? m.series[m.series.length - 1];
  return point?.values[key] ?? null;
}

function Stats({ m }: { m: MetricsResponse }) {
  const empty = m.latestDay === null;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Usuarios" value={empty ? null : latest(m, "users_total")} hint={empty ? undefined : `+${weekSum(m, "users_new")} esta semana`} />
      <StatCard label="Rollos" value={empty ? null : latest(m, "trips_total")} hint={empty ? undefined : `${latest(m, "trips_open") ?? 0} abiertos ahora`} />
      <StatCard label="Fotos" value={empty ? null : latest(m, "media_total")} hint={empty ? undefined : `+${weekSum(m, "media_new")} esta semana`} />
    </div>
  );
}

function Usage({ u, usageError, nowMs, degraded }: { u: UsageResponse | null; usageError: string | null; nowMs: number; degraded: PromiseSettledResult<DegradedMode> }) {
  const stale = u?.usage != null && nowMs - u.usage.fetchedAt > STALE_MS;
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>Uso de Cloudflare (hoy, UTC)</CardTitle>
          {u?.usage ? (
            <p className={`text-xs ${stale ? "text-warning-text" : "text-muted-foreground"}`}>
              Actualizado {relativeMinutes(u.usage.fetchedAt, nowMs)}
            </p>
          ) : null}
        </div>
        {degraded.status === "fulfilled" ? (
          <DegradedSwitch state={degraded.value} />
        ) : (
          <p role="alert" className="text-xs text-destructive-text">
            No pudimos leer el modo degradado: {messageOf(degraded.reason)}
          </p>
        )}
      </CardHeader>
      {degraded.status === "fulfilled" ? (
        <div className="px-(--card-spacing) empty:hidden">
          <DegradedNote state={degraded.value} />
        </div>
      ) : null}
      {u ? (
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {USAGE_METERS.map(({ key, label }) =>
            u.usage ? (
              <UsageMeter key={key} label={label} value={u.usage.values[key]} limit={u.usage.limits[key]} />
            ) : (
              <UsageMeter.Empty key={key} label={label} />
            ),
          )}
          <UsageMeter label="Almacenamiento" value={u.storage.usedBytes} limit={u.storage.limitBytes} format={formatBytes} />
        </CardContent>
      ) : (
        <CardContent>
          <ErrorState message={usageError ?? ""} />
        </CardContent>
      )}
    </Card>
  );
}

async function loadDashboard(token: string | null) {
  const [metrics, usage, degraded] = await Promise.allSettled([
    adminApi.metrics(token, 30),
    adminApi.usage(token),
    adminApi.degraded(token),
  ]);
  return { metrics, usage, degraded, nowMs: Date.now() };
}

export default async function DashboardPage() {
  const { token } = await requireSession();
  const { metrics, usage, degraded, nowMs } = await loadDashboard(token);

  const m = metrics.status === "fulfilled" ? metrics.value : null;
  const subtitle = m?.latestDay ? `al cierre del ${formatUtcDay(m.latestDay)}` : undefined;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={subtitle} />
      <div className="flex flex-col gap-6">
        {metrics.status === "rejected" ? (
          <ErrorState message={messageOf(metrics.reason)} />
        ) : (
          <>
            <Stats m={metrics.value} />
            {metrics.value.latestDay === null ? (
              <EmptyState text="Todavía no hay métricas: el cron las guarda cada día a las 00:05 UTC" />
            ) : (
              <ChartCard title="Últimos 30 días" series={metrics.value.series as { day: string; values: Record<string, number> }[]} keys={CHART_KEYS} />
            )}
          </>
        )}
        <Usage
          u={usage.status === "fulfilled" ? usage.value : null}
          usageError={usage.status === "rejected" ? messageOf(usage.reason) : null}
          nowMs={nowMs}
          degraded={degraded}
        />
      </div>
    </>
  );
}
