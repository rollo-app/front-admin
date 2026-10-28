"use client";

import Link from "next/link";
import { logout } from "@/app/login/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";

const ITEM = "flex min-h-10 items-center justify-between gap-2 rounded-xl px-3 text-sm font-medium";

export function Sidebar({ email, currentPath }: { email: string; currentPath: string }) {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="px-3 pt-1 text-lg font-semibold tracking-tight">Rollo</div>
      <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          if (item.soon) {
            return (
              <span key={item.href} aria-disabled="true" className={cn(ITEM, "cursor-not-allowed text-muted-foreground")}>
                {item.label}
                <Badge variant="secondary">próximamente</Badge>
              </span>
            );
          }
          const active = isActive(item.href, currentPath);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(ITEM, active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-2 border-t pt-4">
        <p className="truncate px-3 text-xs text-muted-foreground">{email}</p>
        <form action={logout}>
          <Button type="submit" variant="outline" className="w-full">
            Salir
          </Button>
        </form>
      </div>
    </div>
  );
}
