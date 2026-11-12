"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { GOOGLE_WEB_CLIENT_ID } from "@/lib/google";
import { googleLogin, type LoginState } from "./actions";

type GoogleId = {
  initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: "popup" }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
};
type WindowWithGoogle = Window & { google?: { accounts: { id: GoogleId } } };

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

/** Loads Google Identity Services once and calls `ready` when `window.google` is there. */
function whenGoogleReady(ready: (id: GoogleId) => void): () => void {
  const w = window as WindowWithGoogle;
  if (w.google) {
    ready(w.google.accounts.id);
    return () => {};
  }
  let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
  if (!script) {
    script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
  }
  const onLoad = () => w.google && ready(w.google.accounts.id);
  script.addEventListener("load", onLoad);
  return () => script?.removeEventListener("load", onLoad);
}

/**
 * Google's own "Continuar con Google" button (Google Identity Services). The browser only talks to Google: the ID token
 * it gets goes to the `googleLogin` server action, which talks to the backend (BFF rule).
 */
export function GoogleButton() {
  const container = useRef<HTMLDivElement>(null);
  const [state, action, pending] = useActionState<LoginState, FormData>(googleLogin, { step: "email" });
  // Google calls back long after the effect below ran: it reads the latest dispatch through this ref.
  const actionRef = useRef(action);
  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  useEffect(
    () =>
      whenGoogleReady((id) => {
        if (!container.current) return;
        id.initialize({
          client_id: GOOGLE_WEB_CLIENT_ID,
          ux_mode: "popup",
          callback: ({ credential }) => {
            const form = new FormData();
            form.set("credential", credential);
            startTransition(() => actionRef.current(form));
          },
        });
        const dark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
        id.renderButton(container.current, {
          type: "standard",
          theme: dark ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: "es",
          width: 320,
        });
      }),
    [],
  );

  return (
    <div className="flex flex-col items-center gap-2" aria-busy={pending}>
      <div data-testid="google-button" ref={container} className="min-h-10" />
      {state.error ? (
        <p role="alert" className="text-sm text-destructive-text">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
