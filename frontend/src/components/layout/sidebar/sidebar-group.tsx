import * as React from "react";

import { cn } from "@/lib/utils";

export interface SidebarGroupProps {
  label?: string;
  collapsed?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Groups related `SidebarItem`s under an optional uppercase label
 * (e.g. "WORKSPACE", "SYSTEM"). The label is hidden — not removed — when
 * the sidebar is collapsed, so screen readers still get the grouping.
 */
export function SidebarGroup({ label, collapsed, children, className }: SidebarGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-col gap-0.5", className)}
    >
      {label && (
        <span
          className={cn(
            "px-2.5 pb-1.5 text-[11px] font-semibold tracking-wide text-text-muted uppercase",
            collapsed && "sr-only"
          )}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
