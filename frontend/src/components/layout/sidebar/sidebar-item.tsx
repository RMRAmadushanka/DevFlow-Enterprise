"use client";

import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { iconSize } from "@/design-system/tokens/icons";

export interface SidebarItemProps {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
  /** When true, render icon-only with a hover tooltip (collapsed rail state). */
  collapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * A single sidebar navigation entry. Purely presentational — the parent
 * (`SidebarNav`) decides `active` (typically via `usePathname()`), this
 * component only renders states.
 */
export const SidebarItem = React.forwardRef<HTMLAnchorElement, SidebarItemProps>(
  function SidebarItem(
    { label, icon: Icon, href, active, badge, disabled, external, collapsed, onNavigate },
    ref
  ) {
    const content = (
      <Link
        ref={ref}
        href={disabled ? "#" : href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled}
        data-sidebar-item
        data-active={active}
        tabIndex={disabled ? -1 : 0}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onNavigate?.();
        }}
        className={cn(
          "group/sidebar-item relative flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-medium outline-none transition-colors",
          "text-text-secondary hover:bg-accent hover:text-text-primary",
          "focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0",
          active && "bg-primary-muted text-primary hover:bg-primary-muted hover:text-primary",
          disabled && "pointer-events-none opacity-40",
          collapsed && "justify-center px-0"
        )}
      >
        <Icon size={iconSize.md} className="shrink-0" aria-hidden="true" />
        {collapsed ? (
          <span className="sr-only">{label}</span>
        ) : (
          <span className="min-w-0 flex-1 truncate">{label}</span>
        )}
        {!collapsed && badge !== undefined && (
          <Badge variant={active ? "default" : "secondary"} className="ml-auto">
            {badge}
          </Badge>
        )}
        {active && (
          <span
            aria-hidden="true"
            className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
          />
        )}
      </Link>
    );

    if (!collapsed) return content;

    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="right">
          {label}
          {badge !== undefined ? ` (${badge})` : ""}
        </TooltipContent>
      </Tooltip>
    );
  }
);
