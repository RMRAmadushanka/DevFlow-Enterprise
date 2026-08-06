import { SERVICE_LABELS } from "../constants/monitoring.constants";
import type {
  MonitoringFilters,
  MonitoringOverview,
  ServiceHealth,
  ServiceKey,
  SystemHealth,
  TrackedError,
} from "../types/monitoring.types";
import { makeSeries } from "../utils/format";
import { alertsService } from "./alerts.service";
import { metricsService } from "./metrics.service";

const delay = (ms = 240) => new Promise((resolve) => setTimeout(resolve, ms));

function systemHealth(): SystemHealth {
  return {
    overall: "degraded",
    availability: 99.72,
    cpu: 64,
    memory: 71,
    disk: 58,
    networkMbps: 420,
    databaseStatus: "healthy",
    apiStatus: "degraded",
    lastUpdated: "2026-08-06T16:00:00.000Z",
  };
}

function services(): ServiceHealth[] {
  const keys = Object.keys(SERVICE_LABELS) as ServiceKey[];
  const statuses: ServiceHealth["status"][] = [
    "healthy",
    "healthy",
    "degraded",
    "healthy",
    "critical",
    "healthy",
    "healthy",
    "degraded",
  ];
  return keys.map((key, index) => ({
    key,
    name: SERVICE_LABELS[key],
    status: statuses[index] ?? "unknown",
    uptime: 99.1 + (index % 5) * 0.15,
    latencyMs: 80 + index * 18,
    lastCheckAt: "2026-08-06T15:58:00.000Z",
    errorRate: index === 4 ? 4.2 : index === 2 ? 1.1 : 0.2,
  }));
}

const errors: TrackedError[] = [
  {
    id: "err_1",
    message: "TypeError: Cannot read properties of undefined (reading 'id')",
    service: "tasks",
    count: 128,
    firstSeenAt: "2026-08-01T10:00:00.000Z",
    lastSeenAt: "2026-08-06T15:40:00.000Z",
    environment: "production",
    status: "open",
    stackTrace:
      "TypeError: Cannot read properties of undefined (reading 'id')\n    at TaskBoard (task-board.tsx:142:18)\n    at renderWithHooks (react-dom.development.js:11548:18)\n    at updateFunctionComponent (react-dom.development.js:14560:20)",
    metadata: { release: "web-console@2.1.0", route: "/tasks" },
    browser: "Chrome 127",
  },
  {
    id: "err_2",
    message: "GatewayTimeout: upstream request timed out",
    service: "deployments",
    count: 42,
    firstSeenAt: "2026-08-05T08:00:00.000Z",
    lastSeenAt: "2026-08-06T14:10:00.000Z",
    environment: "production",
    status: "regressing",
    stackTrace:
      "GatewayTimeout: upstream request timed out\n    at ProxyHandler.forward (gateway.ts:88:11)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)",
    metadata: { cluster: "prod-us-east", service: "deploy-api" },
  },
  {
    id: "err_3",
    message: "ZodError: Invalid document title",
    service: "documents",
    count: 9,
    firstSeenAt: "2026-08-04T12:00:00.000Z",
    lastSeenAt: "2026-08-05T09:00:00.000Z",
    environment: "staging",
    status: "resolved",
    stackTrace:
      "ZodError: Invalid document title\n    at createDocument (document.service.ts:210:13)",
    metadata: { release: "docs@1.0.0" },
    browser: "Firefox 128",
  },
];

function matchesService<T extends { service?: ServiceKey }>(
  item: T,
  filters: MonitoringFilters
): boolean {
  if (filters.service === "all") return true;
  return item.service === filters.service;
}

export const monitoringService = {
  async getOverview(filters: MonitoringFilters): Promise<MonitoringOverview> {
    await delay();
    const [metrics, alerts, incidents] = await Promise.all([
      metricsService.list(filters),
      alertsService.list(filters),
      import("./incidents-data").then((m) => m.listIncidents(filters)),
    ]);

    const filteredErrors = errors.filter((e) => {
      if (!matchesService(e, filters)) return false;
      if (filters.environment !== "all" && e.environment !== filters.environment) return false;
      const q = filters.q.trim().toLowerCase();
      if (q && !`${e.message} ${e.service}`.toLowerCase().includes(q)) return false;
      return true;
    });

    return {
      system: systemHealth(),
      services: services().filter(
        (s) => filters.service === "all" || s.key === filters.service
      ),
      metrics,
      alerts: alerts.slice(0, 6),
      incidents: incidents.slice(0, 5),
      errors: filteredErrors.slice(0, 5),
      alertSummary: {
        critical: alerts.filter((a) => a.severity === "critical").length,
        high: alerts.filter((a) => a.severity === "high").length,
        medium: alerts.filter((a) => a.severity === "medium").length,
        low: alerts.filter((a) => a.severity === "low").length,
        active: alerts.filter((a) => a.status === "active" || a.status === "triggered")
          .length,
      },
    };
  },

  async listServices(filters: MonitoringFilters): Promise<ServiceHealth[]> {
    await delay(180);
    return services().filter(
      (s) => filters.service === "all" || s.key === filters.service
    );
  },

  async listErrors(filters: MonitoringFilters): Promise<TrackedError[]> {
    await delay(200);
    return errors.filter((e) => {
      if (!matchesService(e, filters)) return false;
      if (filters.environment !== "all" && e.environment !== filters.environment) return false;
      if (filters.status !== "all" && e.status !== filters.status) return false;
      const q = filters.q.trim().toLowerCase();
      if (q && !`${e.message} ${e.service}`.toLowerCase().includes(q)) return false;
      return true;
    });
  },

  async getError(id: string): Promise<TrackedError | undefined> {
    await delay(120);
    return errors.find((e) => e.id === id);
  },

  async errorTrend(): Promise<Array<{ label: string; value: number }>> {
    await delay(120);
    return makeSeries(40, 18);
  },
};
