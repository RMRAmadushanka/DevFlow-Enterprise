import * as React from "react";

import { cn } from "@/lib/utils";
import type { DashboardGridItemProps, DashboardGridProps, GridSpan } from "./types";

const gapClassName: Record<NonNullable<DashboardGridProps["gap"]>, string> = {
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
};

const columnsClassName: Record<NonNullable<DashboardGridProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  6: "grid-cols-1 md:grid-cols-3 xl:grid-cols-6",
  12: "grid-cols-1 md:grid-cols-6 xl:grid-cols-12",
};

const spanClassName: Record<GridSpan, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

const mdSpanClassName: Record<GridSpan, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

const xlSpanClassName: Record<GridSpan, string> = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  5: "xl:col-span-5",
  6: "xl:col-span-6",
  7: "xl:col-span-7",
  8: "xl:col-span-8",
  9: "xl:col-span-9",
  10: "xl:col-span-10",
  11: "xl:col-span-11",
  12: "xl:col-span-12",
};

const rowSpanClassName: Record<NonNullable<DashboardGridItemProps["rowSpan"]>, string> = {
  1: "row-span-1",
  2: "row-span-2",
  3: "row-span-3",
};

/**
 * Responsive CSS grid for dashboard widgets.
 * Drag-ready: each item is a discrete cell with stable data attributes —
 * pair with a DnD library later without changing layout markup.
 */
function DashboardGrid({
  columns = 12,
  gap = 4,
  children,
  className,
  label = "Dashboard",
}: DashboardGridProps) {
  return (
    <div
      data-slot="dashboard-grid"
      data-columns={columns}
      role="region"
      aria-label={label}
      className={cn("grid w-full", columnsClassName[columns], gapClassName[gap], className)}
    >
      {children}
    </div>
  );
}

function DashboardGridItem({
  span = 1,
  mdSpan,
  xlSpan,
  rowSpan = 1,
  children,
  className,
}: DashboardGridItemProps) {
  return (
    <div
      data-slot="dashboard-grid-item"
      data-span={span}
      data-md-span={mdSpan}
      data-xl-span={xlSpan}
      className={cn(
        "min-w-0",
        spanClassName[span],
        mdSpan ? mdSpanClassName[mdSpan] : null,
        xlSpan ? xlSpanClassName[xlSpan] : null,
        rowSpanClassName[rowSpan],
        className
      )}
    >
      {children}
    </div>
  );
}

export { DashboardGrid, DashboardGridItem };
