import { z } from "zod";

const projectKeySchema = z
  .string()
  .min(2, "Project key is required")
  .max(12, "Key must be 12 characters or fewer")
  .regex(/^[A-Z][A-Z0-9]*$/, "Use uppercase letters and numbers, starting with a letter");

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name is required").max(80),
  key: projectKeySchema,
  description: z.string().max(500, "Description must be 500 characters or fewer").optional().or(z.literal("")),
  organizationId: z.string().min(1, "Organization is required"),
  teamId: z.string().optional().or(z.literal("")),
  visibility: z.enum(["private", "internal", "public"]),
  repositoryUrl: z
    .string()
    .url("Enter a valid repository URL")
    .optional()
    .or(z.literal("")),
  defaultBranch: z.string().min(1, "Default branch is required").default("main"),
  technologyStack: z.array(z.string()).default([]),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Use a hex color like #2563EB"),
  icon: z.string().optional().or(z.literal("")),
  timezone: z.string().min(1, "Timezone is required"),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
});

export const updateProjectSchema = createProjectSchema.extend({
  status: z.enum(["active", "completed", "paused", "archived", "planning"]).optional(),
});

export const projectSettingsSchema = z.object({
  name: z.string().min(2, "Project name is required").max(80),
  description: z.string().max(500, "Description must be 500 characters or fewer"),
  visibility: z.enum(["private", "internal", "public"]),
  status: z.enum(["active", "completed", "paused", "archived", "planning"]),
  timezone: z.string().min(1, "Timezone is required"),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Use a hex color like #2563EB"),
  repositoryUrl: z.string().url("Enter a valid repository URL").optional().or(z.literal("")),
  defaultBranch: z.string().min(1, "Default branch is required"),
  tags: z.array(z.string()),
});

export const transferProjectOwnershipSchema = z.object({
  memberId: z.string().min(1, "Select a member"),
  confirmation: z.string().min(1, "Type TRANSFER to confirm"),
});

export const deleteProjectSchema = z.object({
  confirmation: z.string().min(1, "Type the project key to confirm"),
});

export const duplicateProjectSchema = z.object({
  name: z.string().min(2, "Project name is required").max(80),
  key: projectKeySchema,
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
export type ProjectSettingsFormValues = z.infer<typeof projectSettingsSchema>;
export type TransferProjectOwnershipFormValues = z.infer<typeof transferProjectOwnershipSchema>;
export type DeleteProjectFormValues = z.infer<typeof deleteProjectSchema>;
export type DuplicateProjectFormValues = z.infer<typeof duplicateProjectSchema>;
