import { DataTable } from "@/components/data/data-table";
import { ErrorState } from "@/components/data/error-state";
import { PageHeader } from "@/components/shell/page-header";
import { ApiError, adminApi } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { parsePageParams, toBackendQuery } from "@/lib/page-params";
import { tripColumns } from "./columns";

export default async function RollosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = parsePageParams(await searchParams, { sort: "createdAt" });
  const { token } = await requireSession();
  let page: Awaited<ReturnType<typeof adminApi.trips>> | null = null;
  let errorMessage: string | null = null;
  try {
    page = await adminApi.trips(token, toBackendQuery(params));
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    errorMessage = e.message;
  }
  return (
    <>
      <PageHeader title="Rollos" />
      {page ? (
        <DataTable
          page={page}
          columns={tripColumns}
          pathname="/rollos"
          params={params}
          searchPlaceholder="Buscar por nombre o código"
          rowHref={(t) => `/rollos/${t.id}`}
          emptyText="No hay rollos que coincidan"
        />
      ) : (
        <ErrorState message={errorMessage ?? "Error"} />
      )}
    </>
  );
}
