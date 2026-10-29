"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DegradedMode } from "@/lib/types";
import { setDegradedMode } from "./dashboard.actions";

export function DegradedSwitch({ state }: { state: DegradedMode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const activating = !state.on;

  function confirm() {
    startTransition(async () => {
      const res = await setDegradedMode(activating);
      setOpen(false);
      if (res.ok) {
        setError(null);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
            state.on ? "bg-destructive/12 text-destructive-text" : "bg-muted text-muted-foreground",
          )}
        >
          Modo degradado: {state.on ? "activo" : "apagado"}
        </span>
        <Button variant={activating ? "destructive" : "outline"} size="sm" onClick={() => { setError(null); setOpen(true); }}>
          {activating ? "Activar" : "Desactivar"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-destructive-text">
          {error}
        </p>
      ) : null}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{activating ? "¿Activar el modo degradado?" : "¿Desactivar el modo degradado?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {activating
                ? "Mientras esté activo, nadie va a poder subir fotos ni videos, crear rollos ni registrarse. Ver, comentar y bajar sigue funcionando."
                : "Se vuelve a permitir subir fotos y videos, crear rollos y registrarse."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant={activating ? "default" : "destructive"} disabled={pending} onClick={confirm}>
              {activating ? "Sí, activar" : "Sí, desactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
