import type * as React from "react";
import type { Tone, TrendDirection } from "@/components/data-display/shared/types";

export type { Tone, TrendDirection };

/** Semantic accent for metric / statistic cards. */
export type MetricVariant = "default" | "success" | "warning" | "danger";

/** Shared async chrome for dashboard widgets. */
export interface WidgetStateProps {
  loading?: boolean;
  /** When true (and not loading/error), shows the empty state. */
  empty?: boolean;
  /** Error content or message. Truthy values switch the widget into error chrome. */
  error?: React.ReactNode;
}

export interface DashboardAction {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

/** Preset date ranges for chart / dashboard filters. */
export type DateRangePreset = "today" | "7d" | "30d" | "90d" | "custom";

export interface DateRangeValue {
  preset: DateRangePreset;
  /** ISO date strings when preset is `custom`. */
  from?: string;
  to?: string;
}

export type ExportFormat = "pdf" | "csv" | "excel";

export type ExportStatus = "idle" | "loading" | "success" | "error";

export type SystemStatus = "healthy" | "warning" | "critical" | "offline";
