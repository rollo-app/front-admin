"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SavedNote } from "../../users/[id]/saved-note";
import { updateTripCap } from "./actions";

export const MAX_CAP = 1000;

function validate(raw: string, min: number): { value: number } | { error: string } {
  const value = Number(raw);
  if (raw.trim() === "" || !Number.isInteger(value)) return { error: "Ingresá un número entero." };
  if (value < min) return { error: `El cupo tiene que ser al menos ${min} (los participantes activos).` };
  if (value > MAX_CAP) return { error: `El cupo no puede superar ${MAX_CAP}.` };
  return { value };
}

export function CapForm({ tripId, activeMembers, maxMembers }: { tripId: string; activeMembers: number; maxMembers: number }) {
  const router = useRouter();
  const [raw, setRaw] = useState(String(maxMembers));
  const [error, setError] = useState<string>();
  const [savedAt, setSavedAt] = useState(0);
  const [pending, startTransition] = useTransition();
  const changed = raw !== String(maxMembers);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    const parsed = validate(raw, activeMembers);
    if ("error" in parsed) {
      setError(parsed.error);
      return;
    }
    startTransition(async () => {
      const res = await updateTripCap(tripId, parsed.value);
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="trip-cap">Cupo máximo</Label>
        <Input
          id="trip-cap"
          type="number"
          inputMode="numeric"
          min={activeMembers}
          max={MAX_CAP}
          step={1}
          value={raw}
          className="w-32"
          aria-invalid={error ? true : undefined}
          aria-describedby="trip-cap-hint"
          onChange={(e) => setRaw(e.target.value)}
        />
        <p id="trip-cap-hint" className="text-xs text-muted-foreground">
          Entre {activeMembers} (participantes activos) y {MAX_CAP}.
        </p>
      </div>
      {error ? <p role="alert" className="text-sm text-destructive-text">{error}</p> : null}
      <SavedNote savedAt={savedAt} />
      <div>
        <Button type="submit" disabled={pending || !changed}>Guardar</Button>
      </div>
    </form>
  );
}
