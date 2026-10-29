"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BADGE_LABEL } from "@/lib/badges";
import { cn } from "@/lib/utils";
import type { AdminUserDetail, Badge } from "@/lib/types";
import { updateUser } from "./actions";
import { SavedNote } from "./saved-note";

const BIO_MAX = 150;
const fieldClass =
  "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm dark:bg-input/30";

const normUsername = (s: string) => s.trim().replace(/^@/, "").toLowerCase();

export function EditUserForm({
  user,
  onCancel,
  onSaved,
}: {
  user: AdminUserDetail;
  onCancel?: () => void;
  onSaved?: (user: AdminUserDetail) => void;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [badge, setBadge] = useState<Badge | "">(user.badge ?? "");
  const [unlimited, setUnlimited] = useState(user.unlimitedRollos);
  const [error, setError] = useState<string>();
  const [usernameError, setUsernameError] = useState<string>();
  const [savedAt, setSavedAt] = useState(0);
  const [pending, startTransition] = useTransition();

  const patch = {
    ...(name.trim() !== (user.name ?? "") ? { name: name.trim() } : {}),
    ...(normUsername(username) !== (user.username ?? "") ? { username: username.trim() } : {}),
    ...(bio.trim() !== (user.bio ?? "") ? { bio: bio.trim() } : {}),
    ...(badge !== (user.badge ?? "") ? { badge: badge === "" ? null : badge } : {}),
    ...(unlimited !== user.unlimitedRollos ? { unlimitedRollos: unlimited } : {}),
  };
  const changed = Object.keys(patch).length > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setUsernameError(undefined);
    startTransition(async () => {
      const res = await updateUser(user.id, patch);
      if (res.ok) {
        setSavedAt(Date.now());
        onSaved?.(res.user);
      } else if (res.field === "username") {
        setUsernameError(res.error);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-name">Nombre</Label>
        <Input id="edit-name" autoFocus value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-username">Username</Label>
        <div className="flex items-center gap-1.5">
          <span aria-hidden className="text-muted-foreground">@</span>
          <Input
            id="edit-username"
            value={username}
            maxLength={30}
            autoCapitalize="none"
            aria-invalid={usernameError ? true : undefined}
            aria-describedby={usernameError ? "edit-username-error edit-username-hint" : "edit-username-hint"}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        {usernameError ? (
          <p id="edit-username-error" role="alert" className="text-sm text-destructive-text">{usernameError}</p>
        ) : null}
        <p id="edit-username-hint" className="text-xs text-muted-foreground">Minúsculas, números, punto y guion bajo</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-bio">Descripción</Label>
        <textarea
          id="edit-bio"
          rows={3}
          value={bio}
          maxLength={BIO_MAX}
          aria-describedby="edit-bio-hint"
          onChange={(e) => setBio(e.target.value)}
          className={cn(fieldClass, "py-1.5")}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span id="edit-bio-hint">Hasta 3 líneas</span>
          <span>{bio.length}/{BIO_MAX}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-badge">Badge</Label>
        <select
          id="edit-badge"
          value={badge}
          onChange={(e) => setBadge(e.target.value as Badge | "")}
          className={cn(fieldClass, "h-8")}
        >
          <option value="">Sin badge</option>
          <option value="founder">{BADGE_LABEL.founder}</option>
          <option value="first_edition">{BADGE_LABEL.first_edition}</option>
        </select>
      </div>
      <div className="flex items-start gap-3">
        <input
          id="edit-unlimited"
          type="checkbox"
          role="switch"
          checked={unlimited}
          aria-describedby="edit-unlimited-hint"
          onChange={(e) => setUnlimited(e.target.checked)}
          className="mt-0.5 size-4 accent-primary"
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor="edit-unlimited">Rollos ilimitados</Label>
          <p id="edit-unlimited-hint" className="text-xs text-muted-foreground">
            Sin tope de rollos sin revelar ni por mes
          </p>
        </div>
      </div>
      {error ? <p role="alert" className="text-sm text-destructive-text">{error}</p> : null}
      {onSaved ? null : <SavedNote savedAt={savedAt} />}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending || !changed}>Guardar</Button>
        <Button type="button" variant="ghost" disabled={pending} onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
