import type * as React from "react";
import type { WidgetStateProps } from "@/components/dashboard/shared/types";

export interface ChartSeries {
  /** Key in each data row. */
  dataKey: string;
  name: string;
  color?: string;
}

export interface ChartDataPoint {
  [key: string]: string | number | null | undefined;
}

export interface ChartCardProps extends WidgetStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  legend?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional export control rendered in the header. */
  exportSlot?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Screen-reader summary of the chart contents. */
  summary?: string;
  onRetry?: () => void;
  emptyState?: React.ReactNode;
  height?: number;
}

export interface BaseChartWidgetProps {
  data: ChartDataPoint[];
  series: ChartSeries[];
  xKey: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
  /** Accessible text summary — required for WCAG non-text content. */
  summary: string;
}

export interface LineChartWidgetProps extends BaseChartWidgetProps {
  /** Connect null gaps. @default true */
  connectNulls?: boolean;
}

export interface AreaChartWidgetProps extends BaseChartWidgetProps {
  /** Stack areas. @default false */
  stacked?: boolean;
}

export interface BarChartWidgetProps extends BaseChartWidgetProps {
  layout?: "vertical" | "horizontal";
  stacked?: boolean;
}

export interface DonutSlice {
  name: string;
  value: number;
  color?: string;
}

export interface DonutChartWidgetProps {
  data: DonutSlice[];
  centerValue?: React.ReactNode;
  centerLabel?: React.ReactNode;
  height?: number;
  showLegend?: boolean;
  className?: string;
  summary: string;
  innerRadius?: number;
  outerRadius?: number;
}

export interface RadarChartWidgetProps {
  data: ChartDataPoint[];
  series: ChartSeries[];
  /** Category axis key (spoke labels). */
  angleKey: string;
  height?: number;
  showLegend?: boolean;
  className?: string;
  summary: string;
}

export interface GaugeChartProps {
  value: number;
  label?: React.ReactNode;
  description?: React.ReactNode;
  min?: number;
  max?: number;
  /** Thresholds for color bands (0–100 scale). */
  thresholds?: { warning: number; danger: number };
  size?: number;
  className?: string;
  summary?: string;
}

export interface HeatMapCell {
  x: string;
  y: string;
  value: number;
}

export interface HeatMapWidgetProps {
  data: HeatMapCell[];
  xLabels: string[];
  yLabels: string[];
  /** Max value for intensity scale. Inferred from data when omitted. */
  maxValue?: number;
  className?: string;
  summary: string;
  showLegend?: boolean;
}
