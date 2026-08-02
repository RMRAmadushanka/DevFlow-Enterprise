import Link from "next/link";

import { cn } from "@/lib/utils";
import { SidebarCollapseButton } from "./sidebar-collapse-button";

export interface SidebarHeaderProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Defaults to a DevFlow "DF" mark — pass a real logo when integrating. */
  logo?: React.ReactNode;
  productName?: string;
  homeHref?: string;
  /** Hide the collapse toggle (e.g. on mobile, where the drawer close button covers this). */
  showCollapseButton?: boolean;
}

/**
 * Top of the sidebar: product mark + name, and the desktop collapse
 * toggle. Purely presentational — collapse state is owned by the parent.
 */
export function SidebarHeader({
  collapsed,
  onToggleCollapse,
  logo,
  productName = "DevFlow",
  homeHref = "/dashboard",
  showCollapseButton = true,
}: SidebarHeaderProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-sidebar-border p-3">
      <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-label={`${productName} home`}
        >
          {logo ?? (
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
            >
              DF
            </span>
          )}
          {!collapsed && (
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {productName}
            </span>
          )}
        </Link>
      </div>
      {showCollapseButton && onToggleCollapse && (
        <SidebarCollapseButton collapsed={!!collapsed} onToggle={onToggleCollapse} />
      )}
    </div>
  );
}
