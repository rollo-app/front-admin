"use client";

import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { titleFor } from "./nav-items";
import { Sidebar } from "./sidebar";

export function AppShell({
  email,
  banner,
  children,
}: {
  email: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <SidebarProvider>
      <Sidebar email={email} currentPath={pathname} />
      <SidebarInset>
        <div className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-background px-4 md:hidden">
          <SidebarTrigger aria-label="Abrir menú" className="size-10" />
          <span className="truncate font-semibold">{titleFor(pathname)}</span>
        </div>
        {banner}
        <div className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
