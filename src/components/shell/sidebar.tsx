"use client";

import Link from "next/link";
import { LogOutIcon } from "lucide-react";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import {
  Sidebar as UiSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";

const ITEM =
  "min-h-9 gap-2 rounded-full px-3 text-sm font-medium text-foreground/70 motion-safe:transition-colors hover:bg-card hover:text-foreground";
const ACTIVE =
  "bg-card text-primary-text shadow-sm hover:text-primary-text data-active:bg-card data-active:font-medium data-active:text-primary-text";

export function Sidebar({ email, currentPath }: { email: string; currentPath: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const initial = (email.trim().charAt(0) || "?").toUpperCase();
  return (
    <UiSidebar className="border-sidebar-border">
      <SidebarHeader className="flex-row items-baseline gap-2 px-5 pt-5 pb-2">
        <span className="text-lg font-semibold tracking-tight">Rollo</span>
        <span className="text-xs text-muted-foreground">Panel</span>
      </SidebarHeader>
      <SidebarContent className="px-3 py-2">
        <nav aria-label="Principal">
          <SidebarMenu className="gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              if (item.soon) {
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<span />}
                      aria-disabled="true"
                      className={cn(ITEM, "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-foreground/70 aria-disabled:opacity-45")}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">pronto</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
              const active = isActive(item.href, currentPath);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} onClick={() => isMobile && setOpenMobile(false)} />}
                    isActive={active}
                    aria-current={active ? "page" : undefined}
                    className={cn(ITEM, active && ACTIVE)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </nav>
      </SidebarContent>
      <SidebarFooter className="flex-row items-center gap-2 p-4">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground"
        >
          {initial}
        </span>
        <span title={email} className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {email}
        </span>
        <form action={logout}>
          <Button type="submit" variant="ghost" aria-label="Salir" className="size-10">
            <LogOutIcon aria-hidden="true" />
          </Button>
        </form>
      </SidebarFooter>
    </UiSidebar>
  );
}
