import type { Tone } from "@/components/data-display/shared/types";
import type { ChartDataPoint } from "@/components/dashboard";

import type {
  AlertSeverity,
  AlertStatus,
  ErrorStatus,
  HealthStatus,
  IncidentStatus,
  MetricPoint,
  MetricSeries,
} from "../types/monitoring.types";

export const HEALTH_TONE: Record<HealthStatus, Tone> = {
  healthy: "success",
  degraded: "warning",
  critical: "danger",
  unknown: "neutral",
};

export const SEVERITY_TONE: Record<AlertSeverity, Tone> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
};

export const ALERT_STATUS_TONE: Record<AlertStatus, Tone> = {
  active: "info",
  triggered: "danger",
  acknowledged: "warning",
  resolved: "success",
  disabled: "neutral",
};

export const INCIDENT_STATUS_TONE: Record<IncidentStatus, Tone> = {
  open: "danger",
  investigating: "warning",
  mitigating: "info",
  resolved: "success",
  postmortem: "neutral",
};

export const ERROR_STATUS_TONE: Record<ErrorStatus, Tone> = {
  open: "danger",
  resolved: "success",
  ignored: "neutral",
  regressing: "warning",
};

export function metricPointsToChartData(points: MetricPoint[]): ChartDataPoint[] {
  return points.map((p) => ({
    label: p.label,
    value: p.value,
    ...(p.secondary !== undefined ? { secondary: p.secondary } : {}),
  }));
}

export function findMetric(
  metrics: MetricSeries[] | undefined,
  key: MetricSeries["key"]
): MetricSeries | undefined {
  return metrics?.find((m) => m.key === key);
}

export function trendFromChange(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}
