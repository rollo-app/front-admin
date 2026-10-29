import { Suspense } from "react";
import { DegradedBanner } from "@/components/shell/degraded-banner";
import { AppShell } from "@/components/shell/app-shell";
import { adminApi } from "@/lib/api";
import { requireSession } from "@/lib/auth";

// A failure here must never block the panel: no banner instead.
async function degradedOn(token: string | null): Promise<boolean> {
  try {
    return (await adminApi.degraded(token)).on;
  } catch {
    return false;
  }
}

// cacheComponents: cookie access must sit under a Suspense boundary.
async function Gate({ children }: { children: React.ReactNode }) {
  const { me, token } = await requireSession();
  const on = await degradedOn(token);
  return (
    <AppShell email={me.email ?? me.name ?? "Superadmin"} banner={<DegradedBanner on={on} />}>
      {children}
    </AppShell>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
