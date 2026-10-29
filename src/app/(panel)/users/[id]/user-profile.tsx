"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BADGE_LABEL } from "@/lib/badges";
import { formatDate, formatInt, relativeMinutes } from "@/lib/format";
import type { AdminUserDetail } from "@/lib/types";
import { EditUserForm } from "./edit-user-form";
import { SavedNote } from "./saved-note";

export function UserProfile({ user: initial }: { user: AdminUserDetail }) {
  const [user, setUser] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState(0);

  const fields: [string, React.ReactNode][] = [
    ["Email", user.email],
    ["Nombre", user.name ?? "—"],
    ["Usuario", user.username ? `@${user.username}` : "—"],
    ["Descripción", user.bio ?? "—"],
    ["Badge", user.badge ? BADGE_LABEL[user.badge] : "—"],
    ["Rollos ilimitados", user.unlimitedRollos ? "sí" : "no"],
    ["Rol", user.appRole === "superadmin" ? <Badge variant="secondary">superadmin</Badge> : "usuario"],
    ["Rollos", formatInt(user.tripCount)],
    ["Fotos", formatInt(user.mediaCount)],
    ["Último acceso", user.lastSeenAt === null ? "nunca" : relativeMinutes(user.lastSeenAt)],
    ["Alta", formatDate(user.createdAt)],
  ];

  return (
    <>
      <PageHeader
        title={user.name ?? user.email}
        subtitle={user.name ? user.email : undefined}
        actions={
          editing ? null : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Editar</Button>
          )
        }
      />
      <Card>
        <CardHeader><CardTitle>Datos</CardTitle></CardHeader>
        <CardContent>
          {editing ? (
            <EditUserForm
              user={user}
              onCancel={() => setEditing(false)}
              onSaved={(u) => {
                setUser(u);
                setEditing(false);
                setSavedAt(Date.now());
              }}
            />
          ) : (
            <>
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                {fields.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b pb-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="min-w-0 whitespace-pre-line break-words text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              {savedAt ? <div className="mt-3"><SavedNote key={savedAt} /></div> : null}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
