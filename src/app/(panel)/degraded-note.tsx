import { formatDateTime } from "@/lib/format";
import type { DegradedMode } from "@/lib/types";

export function DegradedNote({ state }: { state: DegradedMode }) {
  if (state.updatedAt === null) return null;
  return (
    <p className="text-xs text-muted-foreground">
      {state.updatedBy
        ? `cambiado por ${state.updatedBy.email} el ${formatDateTime(state.updatedAt)}`
        : `cambiado con ADMIN_TOKEN el ${formatDateTime(state.updatedAt)}`}
    </p>
  );
}
