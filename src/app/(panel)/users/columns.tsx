import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@/components/data/data-table";
import { formatDate, formatInt, relativeMinutes } from "@/lib/format";
import type { AdminUser } from "@/lib/types";

export const userColumns: ColumnDef<AdminUser>[] = [
  { accessorKey: "email", header: "Email", meta: { sortKey: "email" } },
  {
    header: "Nombre",
    meta: { sortKey: "name" },
    cell: (u) => (
      <span>
        {u.name ?? "—"}
        {u.username ? <span className="ml-1 text-muted-foreground">@{u.username}</span> : null}
      </span>
    ),
  },
  { header: "Rol", cell: (u) => (u.appRole === "superadmin" ? <Badge>superadmin</Badge> : null) },
  { header: "Rollos", cell: (u) => formatInt(u.tripCount), meta: { className: "text-right tabular-nums" } },
  { header: "Fotos", cell: (u) => formatInt(u.mediaCount), meta: { className: "text-right tabular-nums" } },
  {
    header: "Último acceso",
    meta: { sortKey: "lastSeenAt" },
    cell: (u) => (u.lastSeenAt === null ? "nunca" : relativeMinutes(u.lastSeenAt)),
  },
  { header: "Alta", meta: { sortKey: "createdAt" }, cell: (u) => formatDate(u.createdAt) },
];
