"use client";

import { useEffect, useState } from "react";

/** Live region for the "Guardado" confirmation: always mounted, filled on save, fades after ~3 s. */
export function SavedNote({ savedAt }: { savedAt: number }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    if (!savedAt) return;
    const reset = setTimeout(() => setFading(false), 0);
    const t = setTimeout(() => setFading(true), 3000);
    return () => {
      clearTimeout(reset);
      clearTimeout(t);
    };
  }, [savedAt]);
  return (
    <p
      role="status"
      className={`text-sm text-muted-foreground motion-safe:transition-opacity motion-safe:duration-700 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      {savedAt ? "Guardado" : ""}
    </p>
  );
}
