import type * as React from "react";
import type { MetricVariant, TrendDirection } from "@/components/dashboard/shared/types";

export interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  change?: number;
  changeLabel?: string;
  trend?: TrendDirection;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  variant?: MetricVariant;
  loading?: boolean;
  className?: string;
}

export interface StatisticCardProps {
  title: string;
  /** Large headline — often a percentage string like `"98.5%"`. */
  value: React.ReactNode;
  change?: number;
  changeLabel?: string;
  trend?: TrendDirection;
  comparison?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: MetricVariant;
  loading?: boolean;
  className?: string;
}
