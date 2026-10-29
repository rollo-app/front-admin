"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startLogin, verifyLogin, type LoginState } from "./actions";

function FormError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="text-sm text-destructive-text">
      {message}
    </p>
  ) : null;
}

function CodeForm({ email, onBack }: { email: string; onBack: () => void }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(verifyLogin, { step: "code", email });
  return (
    <form action={action} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Te mandamos un código a {email}</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Código</Label>
        <Input id="code" name="code" autoComplete="one-time-code" autoCapitalize="characters" required autoFocus />
      </div>
      <FormError message={state.error} />
      <Button type="submit" disabled={pending}>
        Entrar
      </Button>
      <Button type="button" variant="link" onClick={onBack}>
        Usar otro email
      </Button>
    </form>
  );
}

export function LoginForm() {
  const [back, setBack] = useState(false);
  const [state, action, pending] = useActionState<LoginState, FormData>(async (prev, form) => {
    const next = await startLogin(prev, form);
    setBack(false); // only when the new state arrives, so the old code form never flashes back
    return next;
  }, { step: "email" });

  if (state.step === "code" && state.email && !back) {
    return <CodeForm key={state.email} email={state.email} onBack={() => setBack(true)} />;
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.email} required autoFocus />
      </div>
      <FormError message={state.error} />
      <Button type="submit" disabled={pending}>
        Mandame el código
      </Button>
    </form>
  );
}
