import { Suspense } from "react";
import { requireSession } from "@/lib/auth";

// cacheComponents: cookie access must sit under a Suspense boundary.
async function Gate({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <>{children}</>;
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
