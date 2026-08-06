import type * as React from "react";
import type { WidgetStateProps } from "@/components/dashboard/shared/types";

export interface WidgetCardProps extends WidgetStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Custom empty placeholder. Defaults to DashboardEmptyState. */
  emptyState?: React.ReactNode;
  /** Retry handler surfaced on WidgetError. */
  onRetry?: () => void;
  /** Accessible name when title is omitted. */
  label?: string;
}

export interface DashboardEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: "no-data" | "no-metrics" | "no-activity";
}

export type DashboardSkeletonVariant = "card" | "chart" | "table" | "metric";

export interface DashboardSkeletonProps {
  variant?: DashboardSkeletonVariant;
  className?: string;
  /** Chart skeleton height when variant is `chart`. */
  height?: number;
}

export interface WidgetErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}
