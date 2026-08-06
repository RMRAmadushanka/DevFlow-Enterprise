import { z } from "zod";

export const createCommentSchema = z.object({
  bodyHtml: z
    .string()
    .min(1, "Comment cannot be empty")
    .refine((value) => value.replace(/<[^>]*>/g, "").trim().length > 0, {
      message: "Comment cannot be empty",
    }),
  parentId: z.string().optional(),
});

export const updateCommentSchema = createCommentSchema.omit({ parentId: true });

export type CreateCommentFormValues = z.infer<typeof createCommentSchema>;
export type UpdateCommentFormValues = z.infer<typeof updateCommentSchema>;
