import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("@/app/login/actions", () => ({ logout: vi.fn() }));
import { SidebarProvider } from "@/components/ui/sidebar";
import { isActive, titleFor } from "./nav-items";
import { Sidebar } from "./sidebar";

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

function renderSidebar(currentPath: string, email = "su@rollo.test") {
  return render(
    <SidebarProvider>
      <Sidebar email={email} currentPath={currentPath} />
    </SidebarProvider>,
  );
}

describe("Sidebar", () => {
  it("marks the current section, disables the coming-soon ones and shows the email", () => {
    renderSidebar("/users");
    expect(screen.getByRole("link", { name: "Usuarios" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Rollos").closest("[aria-disabled]")).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("link", { name: /Rollos/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("pronto")).toHaveLength(3);
    expect(screen.getByText("su@rollo.test")).toHaveAttribute("title", "su@rollo.test");
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salir" })).toBeInTheDocument();
  });
  it("keeps Usuarios active on its detail pages", () => {
    renderSidebar("/users/abc");
    expect(screen.getByRole("link", { name: "Usuarios" })).toHaveAttribute("aria-current", "page");
  });
});

describe("nav helpers", () => {
  it("matches path boundaries", () => {
    expect(isActive("/users", "/users")).toBe(true);
    expect(isActive("/users", "/users/1")).toBe(true);
    expect(isActive("/users", "/usersettings")).toBe(false);
    expect(isActive("/", "/users")).toBe(false);
  });
  it("derives the page title", () => {
    expect(titleFor("/")).toBe("Dashboard");
    expect(titleFor("/users")).toBe("Usuarios");
    expect(titleFor("/users/abc")).toBe("Usuario");
  });
});
