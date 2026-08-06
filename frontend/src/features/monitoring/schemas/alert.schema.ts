import { z } from "zod";

import { metricKeySchema, serviceKeySchema } from "./monitoring.schema";

export const createAlertSchema = z.object({
  name: z.string().min(2, "Alert name is required").max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  severity: z.enum(["critical", "high", "medium", "low"]),
  service: serviceKeySchema,
  metric: metricKeySchema,
  threshold: z.coerce.number().min(0, "Threshold must be numeric"),
  condition: z.enum(["gt", "gte", "lt", "lte", "eq"]).default("gte"),
  notificationChannel: z.string().max(80).optional().or(z.literal("")),
});

export const updateAlertSchema = createAlertSchema.partial().extend({
  status: z
    .enum(["active", "triggered", "acknowledged", "resolved", "disabled"])
    .optional(),
});

export const deleteAlertSchema = z.object({
  confirmation: z.string().min(1, "Type DELETE to confirm"),
});

export type CreateAlertFormValues = z.infer<typeof createAlertSchema>;
export type UpdateAlertFormValues = z.infer<typeof updateAlertSchema>;
export type DeleteAlertFormValues = z.infer<typeof deleteAlertSchema>;
