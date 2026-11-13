import Link from "next/link";
import { DataTable } from "@/components/data/data-table";
import { ErrorState } from "@/components/data/error-state";
import { StatCard } from "@/components/data/stat-card";
import { PageHeader } from "@/components/shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, adminApi } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { formatInt } from "@/lib/format";
import { buildPageHref, parsePageParams, toBackendQuery, type PageParams } from "@/lib/page-params";
import { waitlistColumns } from "./columns";

const STATUSES = ["confirmed", "pending", "unsubscribed"] as const;
const FILTERS = [
  { value: undefined, label: "Todos", total: "all" },
  { value: "confirmed", label: "Confirmados", total: "confirmed" },
  { value: "pending", label: "Pendientes", total: "pending" },
  { value: "unsubscribed", label: "Dados de baja", total: "unsubscribed" },
] as const;

export default async function WaitlistPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const parsed = parsePageParams(await searchParams, { sort: "createdAt", filters: ["status"] });
  // Only known statuses reach the backend / the URL.
  const status = (STATUSES as readonly string[]).includes(parsed.filters?.status ?? "") ? parsed.filters!.status : undefined;
  const params: PageParams = { ...parsed, filters: status ? { status } : undefined };
  if (!params.filters) delete params.filters;
  const { token } = await requireSession();
  let page: Awaited<ReturnType<typeof adminApi.waitlist>> | null = null;
  let errorMessage: string | null = null;
  try {
    page = await adminApi.waitlist(token, toBackendQuery(params));
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    errorMessage = e.message;
  }
  return (
    <>
      <PageHeader
        title="Lista de espera"
        actions={
          <Link href="/waitlist/export" prefetch={false} className={buttonVariants({ variant: "default" })}>
            Exportar CSV (confirmados)
          </Link>
        }
      />
      {page ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Confirmados" value={page.totals.confirmed} />
            <StatCard label="Pendientes" value={page.totals.pending} />
            <StatCard label="Dados de baja" value={page.totals.unsubscribed} />
          </div>
          <nav aria-label="Filtrar por estado" className="flex flex-wrap items-center gap-1 text-sm">
            {FILTERS.map((f) => {
              const active = f.value === status;
              return (
                <Link
                  key={f.label}
                  href={buildPageHref("/waitlist", params, { filters: f.value ? { status: f.value } : {} })}
                  aria-current={active ? "true" : undefined}
                  className={cn("rounded-full border px-3 py-1.5 hover:bg-muted", active && "bg-muted font-medium text-foreground")}
                >
                  {`${f.label} (${formatInt(page.totals[f.total])})`}
                </Link>
              );
            })}
          </nav>
          <DataTable
            page={page}
            columns={waitlistColumns}
            pathname="/waitlist"
            params={params}
            searchPlaceholder="Buscar por email"
            emptyText="No hay anotados que coincidan"
          />
        </div>
      ) : (
        <ErrorState message={errorMessage ?? "Error"} />
      )}
    </>
  );
}
