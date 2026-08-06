import { z } from "zod";

export const createReportSchema = z.object({
  name: z.string().min(2, "Report name is required").max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  category: z.enum(["engineering", "executive", "operations", "security"]),
  metrics: z.array(z.string()).min(1, "Select at least one metric"),
  schedule: z.string().max(80).optional().or(z.literal("")),
});

export const exportReportSchema = z.object({
  format: z.enum(["pdf", "csv"]),
  share: z.boolean().default(false),
});

export type CreateReportFormValues = z.infer<typeof createReportSchema>;
export type ExportReportFormValues = z.infer<typeof exportReportSchema>;
