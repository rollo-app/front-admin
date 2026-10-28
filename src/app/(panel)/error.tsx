"use client";

import { ErrorState } from "@/components/data/error-state";
import { Button } from "@/components/ui/button";

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Server-component errors are redacted in production (no useful message), so only show ours when present.
  const detail = error.name === "ApiError" && error.message ? ` ${error.message}` : "";
  return (
    <div className="space-y-4">
      <ErrorState message={`Algo salió mal al hablar con el backend.${detail}`} />
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
