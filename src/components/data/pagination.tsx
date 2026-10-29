import Link from "next/link";
import { cn } from "@/lib/cn";
import { buildPageHref, PAGE_SIZES, type PageParams } from "@/lib/page-params";
import { formatInt } from "@/lib/format";

const linkCls = "rounded-full border px-3 py-1.5 text-sm hover:bg-muted";
const disabledCls = "pointer-events-none rounded-full border px-3 py-1.5 text-sm opacity-50";

export function Pagination({
  pathname, params, page, pageSize, total,
}: { pathname: string; params: PageParams; page: number; pageSize: number; total: number }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const hasPrev = page > 1;
  const hasNext = page * pageSize < total;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">{`Mostrando ${formatInt(from)}–${formatInt(to)} de ${formatInt(total)}`}</p>
      <div className="flex items-center gap-4">
        <nav aria-label="Filas por página" className="flex items-center gap-1 text-muted-foreground">
          <span className="mr-1">Filas</span>
          {PAGE_SIZES.map((s) => (
            <Link
              key={s}
              href={buildPageHref(pathname, params, { pageSize: s })}
              aria-current={s === pageSize ? "true" : undefined}
              aria-label={`${s} filas por página`}
              className={cn("rounded px-2 py-1 hover:bg-muted", s === pageSize && "bg-muted font-medium text-foreground")}
            >
              {s}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {hasPrev ? (
            <Link href={buildPageHref(pathname, params, { page: page - 1 })} className={linkCls}>Anterior</Link>
          ) : (
            <span aria-disabled="true" className={disabledCls}>Anterior</span>
          )}
          {hasNext ? (
            <Link href={buildPageHref(pathname, params, { page: page + 1 })} className={linkCls}>Siguiente</Link>
          ) : (
            <span aria-disabled="true" className={disabledCls}>Siguiente</span>
          )}
        </div>
      </div>
    </div>
  );
}
