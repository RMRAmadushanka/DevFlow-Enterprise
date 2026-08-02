"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { SidebarGroup } from "./sidebar-group";
import { SidebarItem } from "./sidebar-item";
import type { NavGroup } from "./types";

export interface SidebarNavProps {
  groups: NavGroup[];
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Renders a list of `NavGroup`s and derives each item's active state from
 * the current route. Also implements roving arrow-key navigation across
 * all rendered items (Up/Down move focus, Home/End jump to first/last) —
 * an enhancement on top of native Tab order, matching the keyboard feel
 * of Linear/GitHub's sidebars.
 */
export function SidebarNav({ groups, collapsed, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname() ?? "/";
  const navRef = React.useRef<HTMLElement>(null);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

    const root = navRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-sidebar-item]"));
    if (items.length === 0) return;

    const currentIndex = items.findIndex((el) => el === document.activeElement);

    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = currentIndex + 1;
    else if (event.key === "ArrowUp") nextIndex = currentIndex - 1;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = items.length - 1;

    if (nextIndex < 0) nextIndex = items.length - 1;
    if (nextIndex >= items.length) nextIndex = 0;

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      items[nextIndex]?.focus();
    }
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      onKeyDown={handleKeyDown}
      className={className}
    >
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <SidebarGroup key={group.id} label={group.label} collapsed={collapsed}>
            {group.items.map((item) => (
              <SidebarItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                href={item.href}
                badge={item.badge}
                disabled={item.disabled}
                external={item.external}
                collapsed={collapsed}
                active={isItemActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </SidebarGroup>
        ))}
      </div>
    </nav>
  );
}
