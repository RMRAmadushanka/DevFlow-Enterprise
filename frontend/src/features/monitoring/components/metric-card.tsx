"use client";

import { MetricCard as DashboardMetricCard } from "@/components/dashboard";
import type { MetricCardProps as DashboardMetricCardProps } from "@/components/dashboard";

import { trendFromChange } from "./shared";

export type MonitoringMetricCardProps = DashboardMetricCardProps;

/**
 * Feature-level MetricCard wrapper around the dashboard MetricCard.
 * Exported as MetricCard from the monitoring feature barrel.
 */
function MonitoringMetricCard({
  change,
  trend,
  ...props
}: MonitoringMetricCardProps) {
  const resolvedTrend = trend ?? (change !== undefined ? trendFromChange(change) : undefined);
  return <DashboardMetricCard {...props} change={change} trend={resolvedTrend} />;
}

export { MonitoringMetricCard as MetricCard, MonitoringMetricCard };
