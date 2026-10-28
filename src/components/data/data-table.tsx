import Link from "next/link";
import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildPageHref, type PageParams } from "@/lib/page-params";
import type { Page } from "@/lib/types";
import { EmptyState } from "./empty-state";
import { Pagination } from "./pagination";
import { SearchBox } from "./search-box";

/**
 * TanStack-shaped column definition, rendered server-side by hand: `useReactTable` needs a client
 * component, and with manual sorting/paging (all state lives in the URL) it adds nothing.
 */
export type ColumnDef<T> = {
  accessorKey?: keyof T & string;
  header: string;
  /** Custom cell; defaults to String(row[accessorKey]). */
  cell?: (row: T) => ReactNode;
  meta?: { sortKey?: string; className?: string };
};

export function DataTable<T>({
  page, columns, pathname, params, searchPlaceholder, rowHref, emptyText,
}: {
  page: Page<T>;
  columns: ColumnDef<T>[];
  pathname: string;
  params: PageParams;
  searchPlaceholder: string;
  rowHref?: (row: T) => string;
  emptyText: string;
}) {
  const render = (c: ColumnDef<T>, row: T): ReactNode =>
    c.cell ? c.cell(row) : c.accessorKey ? String(row[c.accessorKey] ?? "") : null;

  return (
    <div className="space-y-4">
      <SearchBox params={params} placeholder={searchPlaceholder} />
      {page.items.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c, i) => {
                  const sortKey = c.meta?.sortKey;
                  const active = sortKey !== undefined && params.sort === sortKey;
                  const nextOrder = active && params.order === "asc" ? "desc" : "asc";
                  return (
                    <TableHead
                      key={i}
                      className={c.meta?.className}
                      aria-sort={active ? (params.order === "asc" ? "ascending" : "descending") : undefined}
                    >
                      {sortKey ? (
                        <Link
                          href={buildPageHref(pathname, params, { sort: sortKey, order: nextOrder })}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          {c.header}
                          <span aria-hidden="true" className={active ? "" : "opacity-30"}>
                            {active ? (params.order === "asc" ? "↑" : "↓") : "↕"}
                          </span>
                        </Link>
                      ) : (
                        c.header
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {page.items.map((row, r) => {
                const href = rowHref?.(row);
                return (
                  <TableRow key={r} className={href ? "relative hover:bg-muted/50" : undefined}>
                    {columns.map((c, i) => (
                      <TableCell key={i} className={c.meta?.className}>
                        {i === 0 && href ? (
                          // Overlay link: the whole row is clickable, the first cell is the accessible link.
                          <Link href={href} className="font-medium after:absolute after:inset-0 after:content-['']">
                            {render(c, row)}
                          </Link>
                        ) : (
                          render(c, row)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Pagination pathname={pathname} params={params} page={page.page} pageSize={page.pageSize} total={page.total} />
    </div>
  );
}
