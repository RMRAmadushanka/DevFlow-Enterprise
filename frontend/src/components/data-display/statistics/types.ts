import type * as React from "react";

export interface StatsGridProps {
  children: React.ReactNode;
  /** Number of columns at the widest breakpoint — collapses down responsively. @default 4 */
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export interface StatItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export interface StatsSummaryProps {
  /** A compact, divider-separated list of label/value pairs — e.g. a report header ("24 Projects · 156 Tasks"). */
  items: StatItem[];
  className?: string;
}
