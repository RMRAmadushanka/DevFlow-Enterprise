import { z } from "zod";

export const createSprintSchema = z
  .object({
    name: z.string().min(2, "Sprint name is required").max(80),
    goal: z.string().max(280).optional().or(z.literal("")),
    description: z.string().max(2000).optional().or(z.literal("")),
    projectId: z.string().min(1, "Project is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    capacityPoints: z.coerce.number().min(0, "Capacity must be numeric").max(1000),
    storyPointGoal: z.coerce.number().min(0, "Story points must be numeric").max(1000),
  })
  .superRefine((values, ctx) => {
    if (values.startDate && values.endDate && values.startDate > values.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }
  });

export const updateSprintSchema = createSprintSchema.extend({
  status: z.enum(["planning", "active", "completed", "archived"]).optional(),
});

export const completeSprintSchema = z.object({
  moveIncompleteToBacklog: z.boolean().default(true),
  confirmation: z.string().min(1, "Type COMPLETE to confirm"),
});

export const deleteSprintSchema = z.object({
  confirmation: z.string().min(1, "Type DELETE to confirm"),
});

export const moveTaskToSprintSchema = z.object({
  sprintId: z.string().min(1, "Select a sprint"),
  taskIds: z.array(z.string()).min(1, "Select at least one task"),
});

export type CreateSprintFormValues = z.infer<typeof createSprintSchema>;
export type UpdateSprintFormValues = z.infer<typeof updateSprintSchema>;
export type CompleteSprintFormValues = z.infer<typeof completeSprintSchema>;
export type DeleteSprintFormValues = z.infer<typeof deleteSprintSchema>;
export type MoveTaskToSprintFormValues = z.infer<typeof moveTaskToSprintSchema>;
