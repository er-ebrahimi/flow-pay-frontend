"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WavesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActiveNavItem, NAV_ITEMS } from "./nav-config";

/**
 * Desktop navigation: fixed left rail, lg and up only. Active item uses
 * --sidebar-primary — the one chromatic brand token in the system (royal
 * blue in dark mode), reserved for exactly this purpose.
 */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <WavesIcon aria-hidden="true" className="size-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">
          Flow Pay
        </span>
      </div>

      <nav aria-label="Primary" className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActiveNavItem(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
