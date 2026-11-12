import type { ColumnDef } from "@/components/data/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { WaitlistEntry, WaitlistStatus } from "@/lib/types";

export const WAITLIST_STATUS_LABEL: Record<WaitlistStatus, string> = {
  confirmed: "Confirmado",
  pending: "Pendiente",
  unsubscribed: "Dado de baja",
};

export const waitlistColumns: ColumnDef<WaitlistEntry>[] = [
  { accessorKey: "email", header: "Email", meta: { sortKey: "email" } },
  // Neutral like every badge in the panel: the cobalt primary is only for actions.
  { header: "Estado", cell: (e) => <Badge variant="secondary">{WAITLIST_STATUS_LABEL[e.status]}</Badge> },
  { header: "Origen", cell: (e) => (e.source === "app" ? "App" : "Web") },
  { header: "Anotado", meta: { sortKey: "createdAt" }, cell: (e) => formatDate(e.createdAt) },
  { header: "Confirmado", cell: (e) => (e.confirmedAt === null ? "—" : formatDate(e.confirmedAt)) },
];
