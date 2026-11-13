import Link from "next/link";
import type { ColumnDef } from "@/components/data/data-table";
import { formatDate, formatInt } from "@/lib/format";
import type { AdminTrip } from "@/lib/types";
import { StageBadge } from "./stage-badge";

export const tripColumns: ColumnDef<AdminTrip>[] = [
  { accessorKey: "name", header: "Nombre", meta: { sortKey: "name" } },
  { header: "Código", cell: (t) => <span className="font-mono text-xs">{t.joinCode}</span> },
  {
    header: "Creador",
    cell: (t) =>
      t.creator ? (
        // relative z-10: sits above the row's overlay link so this one is clickable on its own.
        <Link href={`/users/${encodeURIComponent(t.creator.id)}`} className="relative z-10 hover:underline">
          {t.creator.name ?? "—"}
          {t.creator.username ? <span className="ml-1 text-muted-foreground">@{t.creator.username}</span> : null}
        </Link>
      ) : (
        "—"
      ),
  },
  { header: "Etapa", cell: (t) => <StageBadge stage={t.stage} /> },
  {
    header: "Participantes",
    meta: { sortKey: "activeMembers", className: "text-right tabular-nums" },
    cell: (t) => `${formatInt(t.activeMembers)} de ${formatInt(t.maxMembers)}`,
  },
  { header: "Fotos", meta: { sortKey: "mediaCount", className: "text-right tabular-nums" }, cell: (t) => formatInt(t.mediaCount) },
  { header: "Creado", meta: { sortKey: "createdAt" }, cell: (t) => formatDate(t.createdAt) },
];
