import { ArrowLeftRight, History, Home, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The three persistent tabs (docs/FLOW_DIAGRAM.mmd). Single source of truth
 * for both the mobile bottom bar and the desktop sidebar rail — render order
 * is meaningful.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/transactions", label: "History", icon: History },
  { href: "/exchange", label: "Exchange", icon: ArrowLeftRight },
];

/** "/" matches exactly; section roots match their own subtree. */
export function isActiveNavItem(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
