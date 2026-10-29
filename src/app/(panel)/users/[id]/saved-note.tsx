"use client";

import { useEffect, useState } from "react";

/** Small "Guardado" confirmation that fades out after ~3 s. */
export function SavedNote() {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFading(true), 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <p
      role="status"
      className={`text-sm text-muted-foreground motion-safe:transition-opacity motion-safe:duration-700 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      Guardado
    </p>
  );
}
