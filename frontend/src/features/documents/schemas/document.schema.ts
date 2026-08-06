import { z } from "zod";

export const documentVisibilitySchema = z.enum([
  "private",
  "workspace",
  "public",
  "restricted",
]);

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(160, "Title is too long"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
  folderId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  tags: z.array(z.string().min(1).max(32)).max(12).optional(),
  visibility: documentVisibilitySchema.default("workspace"),
  templateId: z.string().nullable().optional(),
  icon: z.string().max(8).optional().or(z.literal("")),
  coverImageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export const updateDocumentSchema = createDocumentSchema.partial().extend({
  contentHtml: z.string().optional(),
  contentMarkdown: z.string().optional(),
});

export const shareDocumentSchema = z.object({
  visibility: documentVisibilitySchema,
  userIds: z.array(z.string()).optional(),
  permission: z.enum(["view", "comment", "edit"]).default("view"),
  publicLinkEnabled: z.boolean().default(false),
});

export const moveDocumentSchema = z.object({
  folderId: z.string().nullable(),
  parentId: z.string().nullable().optional(),
});

export const deleteDocumentSchema = z.object({
  confirmation: z.string().min(1, "Type DELETE to confirm"),
});

export const restoreVersionSchema = z.object({
  confirmation: z.string().min(1, "Type RESTORE to confirm"),
});

export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentFormValues = z.infer<typeof updateDocumentSchema>;
export type ShareDocumentFormValues = z.infer<typeof shareDocumentSchema>;
export type MoveDocumentFormValues = z.infer<typeof moveDocumentSchema>;
export type DeleteDocumentFormValues = z.infer<typeof deleteDocumentSchema>;
export type RestoreVersionFormValues = z.infer<typeof restoreVersionSchema>;
