import type { MetricKey, MetricSeries, MonitoringFilters } from "../types/monitoring.types";
import { makeSeries } from "../utils/format";
import { isLiveBackendMode } from "@/lib/api/live-api";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const METRIC_DEFS: Array<{
  key: MetricKey;
  name: string;
  unit: string;
  current: number;
  previous: number;
  variance: number;
}> = [
  { key: "cpu", name: "CPU Usage", unit: "%", current: 64, previous: 58, variance: 12 },
  { key: "memory", name: "Memory Usage", unit: "%", current: 71, previous: 69, variance: 8 },
  { key: "disk", name: "Disk Usage", unit: "%", current: 58, previous: 55, variance: 4 },
  {
    key: "network",
    name: "Network Traffic",
    unit: "Mbps",
    current: 420,
    previous: 390,
    variance: 60,
  },
  {
    key: "request_rate",
    name: "Request Rate",
    unit: "rpm",
    current: 1840,
    previous: 1720,
    variance: 220,
  },
  {
    key: "response_time",
    name: "Response Time",
    unit: "ms",
    current: 248,
    previous: 210,
    variance: 40,
  },
  {
    key: "error_rate",
    name: "Error Rate",
    unit: "%",
    current: 1.8,
    previous: 1.2,
    variance: 0.6,
  },
  {
    key: "availability",
    name: "Availability",
    unit: "%",
    current: 99.72,
    previous: 99.9,
    variance: 0.08,
  },
];

export const metricsService = {
  async list(_filters: MonitoringFilters): Promise<MetricSeries[]> {
    if (isLiveBackendMode()) return [];
    await delay();
    return METRIC_DEFS.map((def) => ({
      key: def.key,
      name: def.name,
      unit: def.unit,
      current: def.current,
      previous: def.previous,
      trend: Number((((def.current - def.previous) / Math.max(def.previous, 0.01)) * 100).toFixed(1)),
      points: makeSeries(def.current, def.variance),
    }));
  },

  async getByKey(key: MetricKey, filters: MonitoringFilters): Promise<MetricSeries | undefined> {
    const all = await this.list(filters);
    return all.find((m) => m.key === key);
  },
};
