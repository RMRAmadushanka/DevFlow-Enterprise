import { z } from "zod";

/** Zod contracts for create/edit forms — pair with AppForm + React Hook Form. */
export const entityFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  status: z.enum(["active", "archived"]),
});

export type EntityFormValues = z.infer<typeof entityFormSchema>;
