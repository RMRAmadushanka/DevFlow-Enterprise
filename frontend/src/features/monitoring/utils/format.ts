import type { HealthStatus, MetricPoint } from "../types/monitoring.types";

export function makeSeries(
  base: number,
  variance: number,
  labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"]
): MetricPoint[] {
  return labels.map((label, index) => ({
    label,
    value: Math.max(
      0,
      Math.round(base + Math.sin(index * 0.9) * variance + (index % 3) * (variance * 0.15))
    ),
  }));
}

export function healthFromValue(
  value: number,
  warnAt: number,
  criticalAt: number,
  higherIsWorse = true
): HealthStatus {
  if (higherIsWorse) {
    if (value >= criticalAt) return "critical";
    if (value >= warnAt) return "degraded";
    return "healthy";
  }
  if (value <= criticalAt) return "critical";
  if (value <= warnAt) return "degraded";
  return "healthy";
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatMs(value: number): string {
  if (value < 1000) return `${Math.round(value)} ms`;
  return `${(value / 1000).toFixed(2)} s`;
}

export function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
