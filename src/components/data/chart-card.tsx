"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatDayMonth } from "@/lib/format";

export type ChartSeriesPoint = { day: string; values: Record<string, number> };
export type ChartKey = { key: string; label: string; color: string };

export function ChartCard({ title, series, keys }: { title: string; series: ChartSeriesPoint[]; keys: ChartKey[] }) {
  const config: ChartConfig = Object.fromEntries(keys.map((k) => [k.key, { label: k.label, color: k.color }]));
  const data = series.map((p) => ({ ...p.values, day: p.day }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title} <span className="text-xs font-normal text-muted-foreground">(UTC)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <LineChart data={data} margin={{ left: 4, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatDayMonth} />
            <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => formatDayMonth(String(v))} />} />
            {keys.map((k) => (
              <Line key={k.key} dataKey={k.key} type="monotone" stroke={`var(--color-${k.key})`} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ChartContainer>
        <ul className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          {keys.map((k) => (
            <li key={k.key} className="flex items-center gap-1.5">
              <span className="size-2 rounded-[2px]" style={{ backgroundColor: k.color }} />
              {k.label}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
