"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export function AppShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-card md:block">
        <Sidebar email={email} currentPath={pathname} />
      </aside>
      <div className="md:pl-60">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card px-4 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Abrir menú" />}>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetTitle className="sr-only">Menú</SheetTitle>
              <div onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)} className="h-full">
                <Sidebar email={email} currentPath={pathname} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Rollo</span>
        </div>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
