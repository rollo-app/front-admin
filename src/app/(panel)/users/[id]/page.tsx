import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/data/error-state";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, adminApi } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { formatDate, formatInt, relativeMinutes } from "@/lib/format";
import type { AdminUserDetail, TripState } from "@/lib/types";

const STATE_LABEL: Record<TripState, string> = {
  upcoming: "Por empezar", open: "En curso", ended: "Terminado", revealed: "Revelado",
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { token } = await requireSession();
  let user: AdminUserDetail | undefined;
  let failure: ApiError | undefined;
  try {
    user = await adminApi.user(token, id);
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    failure = e;
  }
  // The session was validated by requireSession() in this same render, so a 404 here (even one mapped to
  // NoAccessError) means the user does not exist; a session revoked mid-render is handled on the next navigation.
  // notFound() throws, so it stays outside the try/catch.
  if (failure?.status === 404) notFound();
  if (!user) {
    return (
      <>
        <PageHeader title="Usuario" />
        <ErrorState message={failure?.message ?? "Error"} />
      </>
    );
  }
  const fields: [string, React.ReactNode][] = [
    ["Email", user.email],
    ["Nombre", user.name ?? "—"],
    ["Usuario", user.username ? `@${user.username}` : "—"],
    ["Rol", user.appRole === "superadmin" ? <Badge variant="secondary">superadmin</Badge> : "usuario"],
    ["Rollos", formatInt(user.tripCount)],
    ["Fotos", formatInt(user.mediaCount)],
    ["Último acceso", user.lastSeenAt === null ? "nunca" : relativeMinutes(user.lastSeenAt)],
    ["Alta", formatDate(user.createdAt)],
  ];
  return (
    <>
      <PageHeader title={user.name ?? user.email} subtitle={user.name ? user.email : undefined} />
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {fields.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b pb-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Rollos</CardTitle></CardHeader>
          <CardContent>
            {user.trips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No participa en ningún rollo.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Nombre</TableHead><TableHead>Rol en el rollo</TableHead><TableHead>Estado</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {user.trips.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>{t.role === "admin" ? "Admin" : "Miembro"}</TableCell>
                      <TableCell>{STATE_LABEL[t.state]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Link href="/users" className="text-sm text-muted-foreground hover:text-foreground">← Volver a usuarios</Link>
      </div>
    </>
  );
}
