/**
 * Metrics barrel — KPI cards live in `../cards`; this folder also surfaces
 * the shared data-display `StatCard` for dashboard composition.
 */
export { MetricCard, StatisticCard } from "@/components/dashboard/cards";
export type { MetricCardProps, StatisticCardProps } from "@/components/dashboard/cards";
export { StatCard } from "@/components/data-display/metrics";
export type { StatCardProps } from "@/components/data-display/metrics";
