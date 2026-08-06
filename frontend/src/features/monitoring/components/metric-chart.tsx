"use client";

import {
  AreaChartWidget,
  BarChartWidget,
  ChartCard,
  LineChartWidget,
} from "@/components/dashboard";
import type { ChartSeries } from "@/components/dashboard";

import type { MetricSeries } from "../types/monitoring.types";
import { formatPercent } from "../utils/format";
import { metricPointsToChartData } from "./shared";
import { MetricChartSkeleton } from "./monitoring-skeleton";

export type MetricChartVariant = "line" | "area" | "bar";

export interface MetricChartProps {
  metric?: MetricSeries;
  title?: string;
  description?: string;
  variant?: MetricChartVariant;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  height?: number;
  showLegend?: boolean;
  className?: string;
  seriesOverride?: ChartSeries[];
  valueFormatter?: (value: number) => string;
}

function MetricChart({
  metric,
  title,
  description,
  variant = "line",
  loading,
  error,
  onRetry,
  height = 260,
  showLegend = false,
  className,
  seriesOverride,
  valueFormatter,
}: MetricChartProps) {
  if (loading) return <MetricChartSkeleton />;

  const chartTitle = title ?? metric?.name ?? "Metric";
  const data = metric ? metricPointsToChartData(metric.points) : [];
  const series: ChartSeries[] = seriesOverride ?? [
    { dataKey: "value", name: metric?.name ?? "Value" },
  ];
  const currentLabel = metric
    ? valueFormatter
      ? valueFormatter(metric.current)
      : metric.unit === "%"
        ? formatPercent(metric.current)
        : `${metric.current}${metric.unit ? ` ${metric.unit}` : ""}`
    : undefined;

  const summary = metric
    ? `${chartTitle}: current ${currentLabel}, trend ${metric.trend}%`
    : `${chartTitle} chart`;

  const chart =
    variant === "area" ? (
      <AreaChartWidget
        data={data}
        series={series}
        xKey="label"
        height={height}
        showLegend={showLegend}
        summary={summary}
      />
    ) : variant === "bar" ? (
      <BarChartWidget
        data={data}
        series={series}
        xKey="label"
        height={height}
        showLegend={showLegend}
        summary={summary}
      />
    ) : (
      <LineChartWidget
        data={data}
        series={series}
        xKey="label"
        height={height}
        showLegend={showLegend}
        summary={summary}
      />
    );

  return (
    <ChartCard
      title={chartTitle}
      description={
        description ??
        (currentLabel ? `Current: ${currentLabel}` : undefined)
      }
      loading={false}
      error={error ? "Could not load metric" : undefined}
      onRetry={onRetry}
      empty={!metric || data.length === 0}
      className={className}
      height={height + 80}
      summary={summary}
    >
      {metric && data.length > 0 ? chart : null}
    </ChartCard>
  );
}

export { MetricChart };
