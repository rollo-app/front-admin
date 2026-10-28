import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { requireSession } from "@/lib/auth";

// cacheComponents: cookie access must sit under a Suspense boundary.
async function Gate({ children }: { children: React.ReactNode }) {
  const { me } = await requireSession();
  return <AppShell email={me.email ?? me.name ?? "Superadmin"}>{children}</AppShell>;
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
