import { z } from "zod";

export const repositoryVisibilitySchema = z.enum(["private", "internal", "public"]);
export const repositoryProviderSchema = z.enum([
  "github",
  "gitlab",
  "bitbucket",
  "azure_devops",
  "local",
]);

export const createRepositorySchema = z.object({
  name: z
    .string()
    .min(1, "Repository name is required")
    .max(100)
    .regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dots, hyphens, or underscores"),
  description: z.string().max(500).optional().or(z.literal("")),
  visibility: repositoryVisibilitySchema.default("private"),
  defaultBranch: z.string().min(1, "Default branch is required").max(64).default("main"),
  provider: repositoryProviderSchema.default("local"),
  remoteUrl: z.string().url("Enter a valid repository URL").optional().or(z.literal("")),
  projectId: z.string().nullable().optional(),
  organization: z.string().min(1).max(80).optional().or(z.literal("")),
});

export const connectRepositorySchema = z.object({
  provider: repositoryProviderSchema,
  remoteUrl: z.string().url("Enter a valid repository URL"),
  name: z
    .string()
    .max(100)
    .regex(/^[a-zA-Z0-9._-]*$/, "Invalid repository name")
    .optional()
    .or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  visibility: repositoryVisibilitySchema.default("private"),
  defaultBranch: z.string().min(1).max(64).default("main"),
  projectId: z.string().nullable().optional(),
});

export const updateRepositorySchema = createRepositorySchema.partial();

export const transferRepositorySchema = z.object({
  organization: z.string().min(1, "Organization is required").max(80),
  projectId: z.string().nullable().optional(),
});

export const deleteRepositorySchema = z.object({
  confirmation: z.string().min(1, "Type DELETE to confirm"),
});

export const archiveRepositorySchema = z.object({
  confirmation: z.string().min(1, "Type ARCHIVE to confirm"),
});

export const createWebhookSchema = z.object({
  url: z.string().url("Enter a valid webhook URL"),
  events: z.array(z.string()).min(1, "Select at least one event"),
  secretConfigured: z.boolean().default(true),
});

export const updateWebhookSchema = createWebhookSchema.partial().extend({
  status: z.enum(["active", "disabled", "failing"]).optional(),
});

export type CreateRepositoryFormValues = z.infer<typeof createRepositorySchema>;
export type ConnectRepositoryFormValues = z.infer<typeof connectRepositorySchema>;
export type UpdateRepositoryFormValues = z.infer<typeof updateRepositorySchema>;
export type TransferRepositoryFormValues = z.infer<typeof transferRepositorySchema>;
export type DeleteRepositoryFormValues = z.infer<typeof deleteRepositorySchema>;
export type ArchiveRepositoryFormValues = z.infer<typeof archiveRepositorySchema>;
export type CreateWebhookFormValues = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookFormValues = z.infer<typeof updateWebhookSchema>;
