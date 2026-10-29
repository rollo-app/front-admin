import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/data/error-state";
import { PageHeader } from "@/components/shell/page-header";
import { UserProfile } from "./user-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, adminApi } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { formatDate, relativeMinutes } from "@/lib/format";
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
  return (
    <>
      <div className="space-y-6">
        <UserProfile
          key={user.id}
          user={user}
          lastSeen={user.lastSeenAt === null ? "nunca" : relativeMinutes(user.lastSeenAt)}
          createdAt={formatDate(user.createdAt)}
        />
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
