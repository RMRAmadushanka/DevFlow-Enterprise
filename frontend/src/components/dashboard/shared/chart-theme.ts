import type * as React from "react";

/**
 * Theme-aware chart styling for Recharts.
 * Colors resolve through CSS variables so charts track light/dark mode.
 * Prefer these over hardcoded hex values in feature code.
 */

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const CHART_STATUS = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
  primary: "var(--primary)",
  muted: "var(--muted-foreground)",
  border: "var(--border)",
  foreground: "var(--foreground)",
} as const;

export const chartAxisProps = {
  stroke: "var(--border)",
  tick: { fill: "var(--muted-foreground)", fontSize: 12 },
  tickLine: false as const,
  axisLine: { stroke: "var(--border)" },
};

export const chartGridProps = {
  stroke: "var(--border)",
  strokeDasharray: "3 3",
  vertical: false,
};

export const chartTooltipContentStyle: React.CSSProperties = {
  background: "var(--elevated)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--elevated-foreground)",
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
};

export const chartTooltipLabelStyle: React.CSSProperties = {
  color: "var(--muted-foreground)",
  marginBottom: 4,
};

export function seriesColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]!;
}
