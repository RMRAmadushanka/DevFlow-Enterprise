import { z } from "zod";

export const createDocumentCommentSchema = z.object({
  bodyHtml: z.string().min(1, "Comment cannot be empty").max(8000),
  parentId: z.string().nullable().optional(),
});

export const updateDocumentCommentSchema = z.object({
  bodyHtml: z.string().min(1, "Comment cannot be empty").max(8000).optional(),
  resolved: z.boolean().optional(),
});

export type CreateDocumentCommentFormValues = z.infer<typeof createDocumentCommentSchema>;
export type UpdateDocumentCommentFormValues = z.infer<typeof updateDocumentCommentSchema>;
