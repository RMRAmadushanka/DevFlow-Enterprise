import { z } from "zod";

const statusSchema = z.enum([
  "backlog",
  "todo",
  "in_progress",
  "review",
  "testing",
  "done",
  "blocked",
  "archived",
]);

const prioritySchema = z.enum(["critical", "high", "medium", "low", "none"]);

export const createTaskSchema = z
  .object({
    title: z.string().min(2, "Title is required").max(160),
    description: z.string().max(5000).optional().or(z.literal("")),
    projectId: z.string().min(1, "Project is required"),
    sprintId: z.string().optional().or(z.literal("")),
    status: statusSchema.default("todo"),
    priority: prioritySchema,
    assigneeId: z.string().optional().or(z.literal("")),
    reporterId: z.string().optional().or(z.literal("")),
    labels: z.array(z.string()).default([]),
    storyPoints: z.coerce.number().min(0).max(100).optional().or(z.nan()).optional(),
    estimateMinutes: z.coerce.number().min(0).optional().or(z.nan()).optional(),
    dueDate: z.string().optional().or(z.literal("")),
    startDate: z.string().optional().or(z.literal("")),
    parentId: z.string().optional().or(z.literal("")),
    dependencyIds: z.array(z.string()).default([]),
    checklist: z.array(z.string()).default([]),
  })
  .superRefine((values, ctx) => {
    if (values.startDate && values.dueDate && values.startDate > values.dueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date must be on or after the start date",
        path: ["dueDate"],
      });
    }
  });

export const updateTaskSchema = createTaskSchema;

export const moveTaskSchema = z.object({
  status: statusSchema,
  projectId: z.string().optional(),
});

export const checklistItemSchema = z.object({
  title: z.string().min(1, "Checklist item is required").max(200),
});

export const bulkAssignSchema = z.object({
  assigneeId: z.string().min(1, "Select an assignee"),
});

export const deleteTaskSchema = z.object({
  confirmation: z.string().min(1, "Type DELETE to confirm"),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;
export type MoveTaskFormValues = z.infer<typeof moveTaskSchema>;
export type ChecklistItemFormValues = z.infer<typeof checklistItemSchema>;
export type BulkAssignFormValues = z.infer<typeof bulkAssignSchema>;
export type DeleteTaskFormValues = z.infer<typeof deleteTaskSchema>;
