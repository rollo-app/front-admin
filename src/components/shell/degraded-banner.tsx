"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangleIcon } from "lucide-react";

export function DegradedBanner({ on }: { on: boolean }) {
  const pathname = usePathname();
  if (!on) return null;
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-destructive/12 px-4 py-2.5 text-sm text-destructive-text md:px-8"
    >
      <AlertTriangleIcon aria-hidden="true" className="size-4 shrink-0" />
      <span className="font-medium">
        Modo degradado activo: no se pueden subir fotos, crear rollos ni registrarse.
      </span>
      {pathname !== "/" ? (
        <Link href="/" className="ml-auto rounded-full px-2 underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          Ir al dashboard
        </Link>
      ) : null}
    </div>
  );
}
