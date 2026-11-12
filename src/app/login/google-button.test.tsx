import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

vi.mock("./actions", () => ({
  googleLogin: vi.fn(async () => ({ step: "email", error: "No tenés acceso a este panel" })),
}));
import { googleLogin } from "./actions";
import { GOOGLE_WEB_CLIENT_ID } from "@/lib/google";
import { GoogleButton } from "./google-button";

type Init = { client_id: string; callback: (r: { credential: string }) => void };
let initialize: ReturnType<typeof vi.fn>;
let renderButton: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  initialize = vi.fn();
  renderButton = vi.fn();
  // Google Identity Services already loaded: the component uses it right away.
  (window as unknown as { google: unknown }).google = { accounts: { id: { initialize, renderButton } } };
});
afterEach(() => {
  delete (window as unknown as { google?: unknown }).google;
});

describe("GoogleButton", () => {
  it("renders Google's own button for our web client", () => {
    render(<GoogleButton />);
    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: GOOGLE_WEB_CLIENT_ID }));
    expect(renderButton).toHaveBeenCalledWith(screen.getByTestId("google-button"), expect.objectContaining({ text: "continue_with", locale: "es" }));
  });

  it("sends the credential Google returns to the server action and shows its error", async () => {
    render(<GoogleButton />);
    const { callback } = initialize.mock.calls[0]![0] as Init;
    await act(async () => callback({ credential: "gtok" }));
    const form = vi.mocked(googleLogin).mock.calls[0]![1] as FormData;
    expect(form.get("credential")).toBe("gtok");
    expect(await screen.findByRole("alert")).toHaveTextContent("No tenés acceso a este panel");
  });
});
