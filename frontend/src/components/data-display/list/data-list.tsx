"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/data-display/empty-state";
import { SkeletonText } from "@/components/data-display/skeleton";
import { DataListItem } from "./data-list-item";
import type { DataListProps } from "./types";

/**
 * Compact/comfortable list for notifications, documents, and activity
 * feeds. Handles loading skeletons and empty states; callers own data.
 */
function DataList({
  items,
  density = "comfortable",
  loading,
  empty,
  onItemSelect,
  className,
  label = "Items",
}: DataListProps) {
  if (loading) {
    return (
      <div
        data-slot="data-list"
        aria-busy="true"
        aria-label={label}
        className={cn("rounded-lg border border-border", className)}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "border-b border-border last:border-b-0",
              density === "compact" ? "px-3 py-2" : "px-4 py-3"
            )}
          >
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div data-slot="data-list" className={cn("rounded-lg border border-border", className)}>
        {empty ?? <EmptyState variant="no-data" />}
      </div>
    );
  }

  return (
    <ul
      data-slot="data-list"
      data-density={density}
      aria-label={label}
      className={cn("overflow-hidden rounded-lg border border-border", className)}
    >
      {items.map((item) => (
        <DataListItem
          key={item.id}
          {...item}
          density={density}
          onSelect={onItemSelect ? () => onItemSelect(item.id) : undefined}
        />
      ))}
    </ul>
  );
}

export { DataList };
