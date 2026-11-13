"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import { SavedNote } from "../../users/[id]/saved-note";
import { updateTripOriginals } from "./actions";

type Props = { tripId: string; keepOriginals: boolean; originalsExpireAt: number | null; originalsPurgedAt: number | null };

function explanation({ keepOriginals, originalsExpireAt, originalsPurgedAt }: Props): string {
  if (originalsPurgedAt !== null) return `Las originales se borraron el ${formatDate(originalsPurgedAt)}. Prender esta opción no las recupera.`;
  if (keepOriginals) return "Las originales se guardan para siempre.";
  return originalsExpireAt !== null ? `Las originales se borran el ${formatDate(originalsExpireAt)}` : "";
}

export function OriginalsForm(props: Props) {
  const { tripId, keepOriginals } = props;
  const router = useRouter();
  const [keep, setKeep] = useState(keepOriginals);
  const [error, setError] = useState<string>();
  const [savedAt, setSavedAt] = useState(0);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const res = await updateTripOriginals(tripId, keep);
      if (res.ok) {
        setSavedAt(Date.now());
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <input
          id="trip-keep-originals"
          type="checkbox"
          role="switch"
          checked={keep}
          aria-describedby="trip-keep-originals-hint"
          onChange={(e) => setKeep(e.target.checked)}
          className="mt-0.5 size-4 accent-primary"
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor="trip-keep-originals">Conservar originales</Label>
          <p id="trip-keep-originals-hint" className="text-xs text-muted-foreground">{explanation(props)}</p>
        </div>
      </div>
      {error ? <p role="alert" className="text-sm text-destructive-text">{error}</p> : null}
      <SavedNote savedAt={savedAt} />
      <div>
        <Button type="submit" disabled={pending || keep === keepOriginals}>Guardar</Button>
      </div>
    </form>
  );
}
