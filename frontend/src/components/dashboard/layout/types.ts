import type * as React from "react";

export type DashboardGridColumns = 1 | 2 | 3 | 4 | 6 | 12;

export interface DashboardGridProps {
  /** Desktop column count. Mobile always collapses to 1; tablet uses half (min 2). */
  columns?: DashboardGridColumns;
  /** Tailwind spacing scale for gap (maps to `gap-*`). @default 4 */
  gap?: 2 | 3 | 4 | 5 | 6 | 8;
  children: React.ReactNode;
  className?: string;
  /** Accessible name for the region. */
  label?: string;
}

export type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface DashboardGridItemProps {
  /** Column span at the default (mobile) breakpoint. @default 1 */
  span?: GridSpan;
  /** Column span from `md` and up. */
  mdSpan?: GridSpan;
  /** Column span from `xl` and up. */
  xlSpan?: GridSpan;
  /** Optional row span for drag-ready / tall widgets. */
  rowSpan?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}

export interface DashboardSectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
