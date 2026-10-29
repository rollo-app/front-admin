import { Card } from "@/components/ui/card";
import { formatInt } from "@/lib/format";

export function StatCard({ label, value, hint }: { label: string; value: number | null; hint?: string }) {
  return (
    <Card className="gap-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-3xl font-semibold tabular-nums">{value === null ? "—" : formatInt(value)}</div>
      {hint ? <div className="text-xs text-success-text">{hint}</div> : null}
    </Card>
  );
}
