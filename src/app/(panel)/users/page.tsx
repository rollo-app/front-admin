import { redirect } from "next/navigation";
import { DataTable } from "@/components/data/data-table";
import { ErrorState } from "@/components/data/error-state";
import { PageHeader } from "@/components/shell/page-header";
import { ApiError, NoAccessError, adminApi } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { parsePageParams, toBackendQuery } from "@/lib/page-params";
import { userColumns } from "./columns";

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = parsePageParams(await searchParams, { sort: "createdAt" });
  const { token } = await requireSession();
  let body: React.ReactNode;
  let noAccess = false;
  try {
    const page = await adminApi.users(token, toBackendQuery(params));
    body = (
      <DataTable
        page={page}
        columns={userColumns}
        pathname="/users"
        params={params}
        searchPlaceholder="Buscar por email, nombre o usuario"
        rowHref={(u) => `/users/${u.id}`}
        emptyText="No hay usuarios que coincidan"
      />
    );
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    if (e instanceof NoAccessError) noAccess = true;
    body = <ErrorState message={e.message} />;
  }
  if (noAccess) redirect("/logout");
  return (
    <>
      <PageHeader title="Usuarios" />
      {body}
    </>
  );
}
