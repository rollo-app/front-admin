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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Registrations } from "@/lib/types";
import { setRegistrationsOpen } from "./dashboard.actions";

export function RegistrationsCard({ state }: { state: Registrations }) {
  const router = useRouter();
  const [dialog, setDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const closing = state.open;

  function confirm() {
    startTransition(async () => {
      const res = await setRegistrationsOpen(!closing);
      setDialog(false);
      if (res.ok) {
        setError(null);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>Registros</CardTitle>
          <p className="text-xs text-muted-foreground">
            Los cambios pueden tardar hasta 1 minuto en aplicarse.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                state.open ? "bg-muted text-muted-foreground" : "bg-destructive/12 text-destructive-text",
              )}
            >
              {state.open ? "Registros abiertos" : "Registros cerrados"}
            </span>
            <Button
              variant={closing ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                setError(null);
                setDialog(true);
              }}
            >
              {closing ? "Cerrar registros" : "Abrir registros"}
            </Button>
          </div>
          {error ? (
            <p role="alert" className="text-xs text-destructive-text">
              {error}
            </p>
          ) : null}
        </div>
      </CardHeader>
      {state.updatedAt !== null ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {state.updatedBy
              ? `cambiado por ${state.updatedBy} el ${formatDateTime(state.updatedAt)}`
              : `cambiado el ${formatDateTime(state.updatedAt)}`}
          </p>
        </CardContent>
      ) : null}
      <AlertDialog open={dialog} onOpenChange={setDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{closing ? "¿Cerrar los registros?" : "¿Abrir los registros?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {closing
                ? "Cerrar registros: nadie va a poder crear una cuenta nueva. ¿Seguro?"
                : "Se vuelve a permitir que cualquiera cree una cuenta nueva."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant={closing ? "destructive" : "default"} disabled={pending} onClick={confirm}>
              {closing ? "Sí, cerrar" : "Sí, abrir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
