"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/components/layout/sidebar/types";
import { iconSize } from "@/design-system/tokens/icons";

export interface MobileBottomNavProps {
  /** Keep this short — 4 or 5 items max fit comfortably on a small-mobile viewport. */
  items: NavItem[];
  className?: string;
}

/**
 * Optional fixed bottom tab bar for mobile, as an alternative/complement
 * to the drawer for the most frequently used destinations. Not rendered
 * by default — pass `bottomNavItems` to `<AppShell>` to enable it.
 */
export function MobileBottomNav({ items, className }: MobileBottomNavProps) {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex h-14 items-stretch border-t border-border bg-background/95 backdrop-blur-sm md:hidden",
        className
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium outline-none",
              "focus-visible:ring-2 focus-visible:ring-focus-ring",
              active ? "text-primary" : "text-text-muted"
            )}
          >
            <Icon size={iconSize.md} aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
