import * as React from "react";

import { cn } from "@/lib/utils";
import type { StatsGridProps } from "./types";

const columnsClassName: Record<NonNullable<StatsGridProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 xl:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
  5: "sm:grid-cols-2 xl:grid-cols-5",
};

/** A responsive grid for arranging `StatCard`s — 1 column on mobile, expanding up to `columns` on wider screens. */
function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  return <div className={cn("grid grid-cols-1 gap-4", columnsClassName[columns], className)}>{children}</div>;
}

export { StatsGrid };
