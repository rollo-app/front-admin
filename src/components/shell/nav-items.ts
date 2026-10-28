export type NavItem = { href: string; label: string; soon?: boolean };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Usuarios" },
  { href: "/rollos", label: "Rollos", soon: true },
  { href: "/photos", label: "Fotos", soon: true },
  { href: "/reports", label: "Denuncias", soon: true },
];

export function isActive(href: string, currentPath: string): boolean {
  return href === "/" ? currentPath === "/" : currentPath.startsWith(href);
}
