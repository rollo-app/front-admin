import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PageParams } from "@/lib/page-params";

/** Plain GET form: submitting navigates with q and (by omission) page=1. */
export function SearchBox({ params, placeholder }: { params: PageParams; placeholder: string }) {
  return (
    <form method="get" role="search" className="flex items-center gap-2">
      <input type="hidden" name="pageSize" value={params.pageSize} />
      {params.sort ? <input type="hidden" name="sort" value={params.sort} /> : null}
      <input type="hidden" name="order" value={params.order} />
      <Input type="search" name="q" defaultValue={params.q ?? ""} placeholder={placeholder} aria-label={placeholder} className="w-64" />
      <Button type="submit" variant="outline">Buscar</Button>
    </form>
  );
}
