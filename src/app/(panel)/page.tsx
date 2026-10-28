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
import type { Metric, MetricsResponse, UsageMetric, UsageResponse } from "@/lib/types";
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

function weekSum(m: MetricsResponse, key: Metric): number {
  return m.series.slice(-7).reduce((acc, p) => acc + (p.values[key] ?? 0), 0);
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

function Usage({ u }: { u: UsageResponse }) {
  const stale = u.usage !== null && Date.now() - u.usage.fetchedAt > STALE_MS;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso de Cloudflare (hoy, UTC)</CardTitle>
        {u.usage ? (
          <p className={`text-xs ${stale ? "text-warning" : "text-muted-foreground"}`}>
            Actualizado {relativeMinutes(u.usage.fetchedAt)}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {USAGE_METERS.map(({ key, label }) =>
          u.usage ? (
            <UsageMeter key={key} label={label} value={u.usage.values[key]} limit={u.usage.limits[key]} />
          ) : (
            <UsageMeter.Empty key={key} label={label} />
          ),
        )}
        <UsageMeter label="Almacenamiento" value={u.storage.usedBytes} limit={u.storage.limitBytes} format={formatBytes} />
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const { token } = await requireSession();
  const [metrics, usage, degraded] = await Promise.allSettled([
    adminApi.metrics(token, 30),
    adminApi.usage(token),
    adminApi.degraded(token),
  ]);

  const m = metrics.status === "fulfilled" ? metrics.value : null;
  const subtitle = m?.latestDay ? `al cierre del ${formatUtcDay(m.latestDay)}` : undefined;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={subtitle} />
      <div className="space-y-6">
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
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          {usage.status === "rejected" ? <ErrorState message={messageOf(usage.reason)} /> : <Usage u={usage.value} />}
          {degraded.status === "rejected" ? <ErrorState message={messageOf(degraded.reason)} /> : <DegradedSwitch state={degraded.value} />}
        </div>
      </div>
    </>
  );
}
