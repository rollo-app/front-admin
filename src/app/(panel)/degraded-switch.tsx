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
import { formatDate } from "@/lib/format";
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
    <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">Modo degradado: {state.on ? "prendido" : "apagado"}</span>
        <Button variant={activating ? "outline" : "destructive"} size="sm" onClick={() => { setError(null); setOpen(true); }}>
          {activating ? "Activar" : "Desactivar"}
        </Button>
      </div>
      {state.updatedBy && state.updatedAt !== null ? (
        <p className="text-xs text-muted-foreground">
          cambiado por {state.updatedBy.email} el {formatDate(state.updatedAt)}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
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
