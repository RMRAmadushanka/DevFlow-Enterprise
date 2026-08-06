import type * as React from "react";
import type { TrendDirection } from "@/components/data-display/shared/types";

export interface StatCardProps {
  title: string;
  /** The headline number/value, e.g. `24` or `"$12,400"`. */
  value: React.ReactNode;
  /** A percentage/delta shown next to the trend arrow, e.g. `12` renders as `"+12%"`. */
  change?: number;
  /** Text appended after the change, e.g. `"this month"`. */
  changeLabel?: string;
  /** Arrow direction + tone. Inferred from the sign of `change` when omitted. */
  trend?: TrendDirection;
  /** Small icon shown in the card's corner. */
  icon?: React.ReactNode;
  /** Replaces the change row entirely with custom copy. */
  description?: React.ReactNode;
  /** Shows a skeleton placeholder instead of the value/change. */
  loading?: boolean;
  className?: string;
}
