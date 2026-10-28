import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";

export default function NotFound() {
  return (
    <>
      <PageHeader title="No encontrado" subtitle="Eso que buscás no existe o ya no está." />
      <Link href="/" className="text-sm underline underline-offset-4">Volver al dashboard</Link>
    </>
  );
}
