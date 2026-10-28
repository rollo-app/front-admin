import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "./data-table";

const page = { items: [{ id: "1", email: "a@x" }, { id: "2", email: "b@x" }], page: 2, pageSize: 25, total: 57 };
const columns = [{ accessorKey: "email", header: "Email", meta: { sortKey: "email" } }];
const params = { page: 2, pageSize: 25, order: "desc" as const };

describe("DataTable", () => {
  it("shows the range, links prev/next and sortable headers, and rows as links", () => {
    render(<DataTable page={page} columns={columns as any} pathname="/users" params={params} searchPlaceholder="Buscar" rowHref={(r: any) => `/users/${r.id}`} emptyText="Nada" />);
    expect(screen.getByText("Mostrando 26–50 de 57")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Anterior" })).toHaveAttribute("href", "/users?page=1&pageSize=25&order=desc");
    expect(screen.getByRole("link", { name: "Siguiente" })).toHaveAttribute("href", "/users?page=3&pageSize=25&order=desc");
    expect(screen.getByRole("link", { name: /Email/ })).toHaveAttribute("href", "/users?page=1&pageSize=25&sort=email&order=asc");
    expect(screen.getByRole("link", { name: "a@x" })).toHaveAttribute("href", "/users/1");
  });
  it("renders the empty text when there are no rows", () => {
    render(<DataTable page={{ ...page, items: [], total: 0 }} columns={columns as any} pathname="/users" params={params} searchPlaceholder="Buscar" emptyText="No hay usuarios" />);
    expect(screen.getByText("No hay usuarios")).toBeInTheDocument();
  });
});
