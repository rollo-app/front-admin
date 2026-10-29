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

// Streams on its own so a slow /admin/degraded-mode never stalls the shell or the page.
async function Banner({ token }: { token: string | null }) {
  return <DegradedBanner on={await degradedOn(token)} />;
}

// cacheComponents: cookie access must sit under a Suspense boundary.
async function Gate({ children }: { children: React.ReactNode }) {
  const { me, token } = await requireSession();
  return (
    <AppShell email={me.email ?? me.name ?? "Superadmin"} banner={
        <Suspense fallback={null}>
          <Banner token={token} />
        </Suspense>
      }>
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
