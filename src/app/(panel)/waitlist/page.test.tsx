import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("@/lib/auth", () => ({ requireSession: vi.fn(async () => ({ token: "tok" })) }));
vi.mock("@/lib/api", async (orig) => ({ ...(await orig<typeof import("@/lib/api")>()), adminApi: { waitlist: vi.fn() } }));
import { ApiError, adminApi } from "@/lib/api";
import WaitlistPage from "./page";

const entry = { email: "ana@example.com", source: "web" as const, status: "confirmed" as const, createdAt: Date.UTC(2026, 9, 1, 15), confirmedAt: Date.UTC(2026, 9, 2, 15), unsubscribedAt: null };
const pending = { email: "beto@example.com", source: "app" as const, status: "pending" as const, createdAt: Date.UTC(2026, 9, 3, 15), confirmedAt: null, unsubscribedAt: null };
const totals = { all: 1500, confirmed: 1000, pending: 400, unsubscribed: 100 };
const data = (items = [entry, pending]) => ({ items, page: 1, pageSize: 25, total: items.length, totals });
const run = async (sp: Record<string, string | undefined>) => render(await WaitlistPage({ searchParams: Promise.resolve(sp) }));

beforeEach(() => vi.clearAllMocks());

describe("WaitlistPage", () => {
  it("renders heading, totals, rows and the export button", async () => {
    vi.mocked(adminApi.waitlist).mockResolvedValue(data());
    await run({});
    expect(screen.getByRole("heading", { name: "Lista de espera" })).toBeInTheDocument();
    expect(screen.getByText("Confirmados").nextElementSibling).toHaveTextContent("1.000");
    expect(screen.getByText("Pendientes").nextElementSibling).toHaveTextContent("400");
    expect(screen.getByText("Dados de baja").nextElementSibling).toHaveTextContent("100");
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    const row = screen.getByText("beto@example.com").closest("tr")!;
    expect(row).toHaveTextContent("Pendiente");
    expect(row).toHaveTextContent("App");
    expect(row).toHaveTextContent("03/10/2026");
    expect(screen.getByText("ana@example.com").closest("tr")).toHaveTextContent("Web");
    expect(screen.getByRole("link", { name: "Exportar CSV (confirmados)" })).toHaveAttribute("href", "/waitlist/export");
    expect(screen.getByPlaceholderText("Buscar por email")).toBeInTheDocument();
  });
  it("sends createdAt desc and no status by default", async () => {
    vi.mocked(adminApi.waitlist).mockResolvedValue(data());
    await run({});
    expect(Object.fromEntries(vi.mocked(adminApi.waitlist).mock.calls[0][1])).toEqual({ page: "1", pageSize: "25", order: "desc", sort: "createdAt" });
  });
  it("forwards status, q, sort and paging from the URL", async () => {
    vi.mocked(adminApi.waitlist).mockResolvedValue(data([]));
    await run({ status: "pending", q: "be", sort: "email", order: "asc", page: "2", pageSize: "50" });
    expect(Object.fromEntries(vi.mocked(adminApi.waitlist).mock.calls[0][1])).toEqual({
      page: "2", pageSize: "50", order: "asc", sort: "email", q: "be", status: "pending",
    });
  });
  it("ignores an unknown status", async () => {
    vi.mocked(adminApi.waitlist).mockResolvedValue(data());
    await run({ status: "hacked" });
    expect(vi.mocked(adminApi.waitlist).mock.calls[0][1].has("status")).toBe(false);
  });
  it("renders the status filter as links that reset the page and mark the current one", async () => {
    vi.mocked(adminApi.waitlist).mockResolvedValue(data());
    await run({ status: "pending", page: "3", q: "be" });
    const nav = screen.getByRole("navigation", { name: "Filtrar por estado" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pendientes (400)" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Confirmados (1.000)" })).toHaveAttribute("href", expect.stringContaining("status=confirmed"));
    expect(screen.getByRole("link", { name: "Confirmados (1.000)" })).toHaveAttribute("href", expect.stringContaining("page=1"));
    expect(screen.getByRole("link", { name: "Todos (1.500)" }).getAttribute("href")).not.toContain("status=");
  });
  it("keeps the status in the search form", async () => {
    vi.mocked(adminApi.waitlist).mockResolvedValue(data());
    const { container } = await run({ status: "pending" });
    expect(container.querySelector('input[type="hidden"][name="status"]')).toHaveValue("pending");
  });
  it("shows the empty state", async () => {
    vi.mocked(adminApi.waitlist).mockResolvedValue(data([]));
    await run({});
    expect(screen.getByText("No hay anotados que coincidan")).toBeInTheDocument();
  });
  it("shows the error state when the backend fails", async () => {
    vi.mocked(adminApi.waitlist).mockRejectedValue(new ApiError(503, "En mantenimiento"));
    await run({});
    expect(screen.getByRole("alert")).toHaveTextContent("En mantenimiento");
  });
});
