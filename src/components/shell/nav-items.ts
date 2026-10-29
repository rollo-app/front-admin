import { Film, Flag, Image, LayoutDashboard, Users, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; soon?: boolean };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/rollos", label: "Rollos", icon: Film, soon: true },
  { href: "/photos", label: "Fotos", icon: Image, soon: true },
  { href: "/reports", label: "Denuncias", icon: Flag, soon: true },
];

export function isActive(href: string, currentPath: string): boolean {
  return href === "/" ? currentPath === "/" : currentPath === href || currentPath.startsWith(href + "/");
}

/** Title of the current page for the mobile top bar. */
export function titleFor(currentPath: string): string {
  if (currentPath.startsWith("/users/")) return "Usuario";
  return NAV_ITEMS.find((i) => isActive(i.href, currentPath))?.label ?? "Panel";
}
