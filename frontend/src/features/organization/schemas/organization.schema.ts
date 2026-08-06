import { z } from "zod";

const slugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(48, "Slug must be 48 characters or fewer")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  slug: slugSchema,
  description: z.string().max(280, "Description must be 280 characters or fewer").optional().or(z.literal("")),
  industry: z.enum(["technology", "finance", "healthcare", "education", "retail", "other"]),
  timezone: z.string().min(1, "Timezone is required"),
  logoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  description: z.string().max(280, "Description must be 280 characters or fewer"),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(1, "Language is required"),
  dateFormat: z.enum(["MDY", "DMY", "YMD"]),
  industry: z.enum(["technology", "finance", "healthcare", "education", "retail", "other"]),
});

export const brandingSchema = z.object({
  logoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Use a hex color like #2563EB"),
  accentColor: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Use a hex color like #0F172A"),
});

export const transferOwnershipSchema = z.object({
  memberId: z.string().min(1, "Select a member"),
  confirmation: z.string().min(1, "Type TRANSFER to confirm"),
});

export const deleteOrganizationSchema = z.object({
  confirmation: z.string().min(1, "Type the organization slug to confirm"),
});

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationFormValues = z.infer<typeof updateOrganizationSchema>;
export type BrandingFormValues = z.infer<typeof brandingSchema>;
export type TransferOwnershipFormValues = z.infer<typeof transferOwnershipSchema>;
export type DeleteOrganizationFormValues = z.infer<typeof deleteOrganizationSchema>;
