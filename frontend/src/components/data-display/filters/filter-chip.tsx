"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FilterChipProps {
  label: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

/** Removable active-filter chip shown in the AdvancedFilter bar. */
function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <span
      data-slot="filter-chip"
      className={cn(
        "inline-flex h-7 max-w-full items-center gap-1 rounded-full border border-border bg-muted/60 pl-2.5 pr-1 text-xs font-medium text-foreground",
        className
      )}
    >
      <span className="truncate">{label}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label="Remove filter"
          onClick={onRemove}
          className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

export { FilterChip };
