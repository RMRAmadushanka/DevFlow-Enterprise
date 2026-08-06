import { z } from "zod";

export const environmentSchema = z.enum(["production", "staging", "development"]);

export const serviceKeySchema = z.enum([
  "authentication",
  "projects",
  "tasks",
  "repositories",
  "deployments",
  "documents",
  "notifications",
  "analytics",
]);

export const metricKeySchema = z.enum([
  "cpu",
  "memory",
  "disk",
  "network",
  "request_rate",
  "response_time",
  "error_rate",
  "availability",
]);

export const monitoringFiltersSchema = z.object({
  q: z.string().optional(),
  dateFrom: z.string().nullable().optional(),
  dateTo: z.string().nullable().optional(),
  environment: z.union([environmentSchema, z.literal("all")]).default("all"),
  service: z.union([serviceKeySchema, z.literal("all")]).default("all"),
  severity: z
    .enum(["critical", "high", "medium", "low", "all"])
    .default("all"),
  status: z.string().default("all"),
  userId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});

export type MonitoringFiltersFormValues = z.infer<typeof monitoringFiltersSchema>;
