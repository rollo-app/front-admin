import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";

// Unmatched URLs don't reach the (panel) group's not-found, so the root one repeats the copy.
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <PageHeader title="No encontrado" subtitle="Eso que buscás no existe o ya no está." />
      <Link href="/" className="text-sm underline underline-offset-4">Volver al dashboard</Link>
    </main>
  );
}
