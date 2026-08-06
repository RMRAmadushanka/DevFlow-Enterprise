"use client";

import Link from "next/link";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

export type TaskEmptyVariant =
  | "no-tasks"
  | "no-results"
  | "no-comments"
  | "no-attachments"
  | "no-checklist";

const COPY: Record<
  TaskEmptyVariant,
  { title: string; description: string; showCreate?: boolean }
> = {
  "no-tasks": {
    title: "No tasks",
    description: "Create a task to start tracking work across your projects.",
    showCreate: true,
  },
  "no-results": {
    title: "No matching tasks",
    description: "Try adjusting search or filters to find what you need.",
  },
  "no-comments": {
    title: "No comments yet",
    description: "Start the conversation by adding the first comment.",
  },
  "no-attachments": {
    title: "No attachments",
    description: "Upload files to share context with your team.",
  },
  "no-checklist": {
    title: "No checklist items",
    description: "Break this task into smaller steps with a checklist.",
  },
};

export interface TaskEmptyStateProps {
  variant?: TaskEmptyVariant;
  action?: React.ReactNode;
}

function TaskEmptyState({ variant = "no-tasks", action }: TaskEmptyStateProps) {
  const copy = COPY[variant];
  return (
    <FeatureEmptyState
      variant={variant === "no-results" ? "no-results" : "no-data"}
      title={copy.title}
      description={copy.description}
      action={
        action ??
        (copy.showCreate ? (
          <PermissionGuard permission="task.create">
            <Button render={<Link href={routes.app.taskNew} />}>Create task</Button>
          </PermissionGuard>
        ) : undefined)
      }
    />
  );
}

export { TaskEmptyState };
