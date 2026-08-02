"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { iconSize } from "@/design-system/tokens/icons";
import { useLayoutStore } from "@/store/layout-store";

export interface GlobalSearchTriggerProps {
  className?: string;
}

/**
 * Opens the global `CommandMenu`. Rendered in the navbar as a
 * search-input-shaped button (not a real input) — clicking or focusing
 * it opens the actual searchable command palette, matching the
 * Linear/VS Code "fake input that opens a real search" pattern.
 *
 * A single element handles both breakpoints — the placeholder text and
 * shortcut hint hide on narrow viewports via CSS, rather than rendering
 * two separate buttons, so there is always exactly one accessible
 * "Open search and command menu" control in the DOM.
 */
export function GlobalSearchTrigger({ className }: GlobalSearchTriggerProps) {
  const setCommandMenuOpen = useLayoutStore((state) => state.setCommandMenuOpen);

  return (
    <button
      type="button"
      onClick={() => setCommandMenuOpen(true)}
      aria-label="Open search and command menu"
      className={cn(
        "flex h-9 w-9 items-center justify-center gap-2 rounded-md border border-input bg-surface text-sm text-text-muted outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-focus-ring sm:w-64 sm:justify-start sm:px-2.5",
        className
      )}
    >
      <Search size={iconSize.sm} className="shrink-0" aria-hidden="true" />
      <span className="hidden flex-1 truncate text-left sm:inline">Search…</span>
      <kbd className="hidden shrink-0 items-center gap-0.5 rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-text-muted sm:flex">
        ⌘K
      </kbd>
    </button>
  );
}
