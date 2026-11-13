import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/data/error-state";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, adminApi } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { formatDate, formatDateTime, formatInt } from "@/lib/format";
import type { AdminTripDetail } from "@/lib/types";
import { StageBadge } from "../stage-badge";
import { CapForm } from "./cap-form";
import { OriginalsForm } from "./originals-form";

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { token } = await requireSession();
  let trip: AdminTripDetail | undefined;
  let failure: ApiError | undefined;
  try {
    trip = await adminApi.trip(token, id);
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    failure = e;
  }
  // The session was validated by requireSession() in this same render, so a 404 here means the rollo does not exist.
  // notFound() throws, so it stays outside the try/catch.
  if (failure?.status === 404) notFound();
  if (!trip) {
    return (
      <>
        <PageHeader title="Rollo" />
        <ErrorState message={failure?.message ?? "Error"} />
      </>
    );
  }
  const fields: [string, React.ReactNode][] = [
    ["Tipo", trip.type === "event" ? "Evento" : "Rollo"],
    ["Código", <span key="c" className="font-mono">{trip.joinCode}</span>],
    [
      "Creador",
      trip.creator ? (
        <Link href={`/users/${encodeURIComponent(trip.creator.id)}`} className="hover:underline">
          {trip.creator.name ?? "—"}
          {trip.creator.username ? <span className="ml-1 text-muted-foreground">@{trip.creator.username}</span> : null}
        </Link>
      ) : (
        "—"
      ),
    ],
    ["Inicio", formatDateTime(trip.startsAt)],
    ["Fin", formatDateTime(trip.endsAt)],
    ["Revelado", formatDateTime(trip.revealAt)],
    ["Creado", formatDate(trip.createdAt)],
    ["Fotos", formatInt(trip.mediaCount)],
    ["Participantes", `${formatInt(trip.activeMembers)} de ${formatInt(trip.maxMembers)}`],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={trip.name} actions={<StageBadge stage={trip.stage} />} />
      <Card>
        <CardHeader><CardTitle>Datos</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {fields.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="min-w-0 break-words text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Cupo de participantes</CardTitle></CardHeader>
        <CardContent>
          <CapForm key={trip.maxMembers} tripId={trip.id} activeMembers={trip.activeMembers} maxMembers={trip.maxMembers} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Fotos originales</CardTitle></CardHeader>
        <CardContent>
          <OriginalsForm
            key={String(trip.keepOriginals)}
            tripId={trip.id}
            keepOriginals={trip.keepOriginals}
            originalsExpireAt={trip.originalsExpireAt}
            originalsPurgedAt={trip.originalsPurgedAt}
          />
        </CardContent>
      </Card>
      {trip.type === "event" ? (
        <Card>
          <CardHeader><CardTitle>Grupos</CardTitle></CardHeader>
          <CardContent>
            {trip.groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay grupos.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Nombre</TableHead><TableHead>Personas</TableHead><TableHead>Fotos</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {trip.groups.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell>{formatInt(g.memberCount)}</TableCell>
                      <TableCell>{formatInt(g.mediaCount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader><CardTitle>Participantes</CardTitle></CardHeader>
        <CardContent>
          {trip.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay participantes activos.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Nombre</TableHead><TableHead>Rol</TableHead><TableHead>Se unió</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {trip.members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link href={`/users/${encodeURIComponent(m.userId)}`} className="font-medium hover:underline">
                        {m.name ?? "—"}
                      </Link>
                      {m.username ? <span className="ml-1 text-muted-foreground">@{m.username}</span> : null}
                    </TableCell>
                    <TableCell>
                      {m.isCreator ? <Badge variant="secondary">Creador</Badge> : m.role === "admin" ? <Badge variant="secondary">Admin</Badge> : "Miembro"}
                    </TableCell>
                    <TableCell>{formatDate(m.joinedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Link href="/rollos" className="text-sm text-muted-foreground hover:text-foreground">← Volver a rollos</Link>
    </div>
  );
}
