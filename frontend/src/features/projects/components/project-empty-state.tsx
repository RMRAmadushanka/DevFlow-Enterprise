"use client";

import Link from "next/link";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

export type ProjectEmptyVariant =
  | "no-projects"
  | "no-repository"
  | "no-members"
  | "no-activity"
  | "no-analytics"
  | "no-results";

const COPY: Record<
  ProjectEmptyVariant,
  { title: string; description: string; showCreate?: boolean }
> = {
  "no-projects": {
    title: "No projects",
    description: "Create a project to start tracking delivery across your engineering teams.",
    showCreate: true,
  },
  "no-results": {
    title: "No matching projects",
    description: "Try adjusting search or filters to find what you need.",
  },
  "no-repository": {
    title: "No repository connected",
    description: "Connect a Git repository to track branches, commits, and releases.",
  },
  "no-members": {
    title: "No members",
    description: "Invite teammates to collaborate on this project.",
  },
  "no-activity": {
    title: "No activity yet",
    description: "Project events will appear here as work progresses.",
  },
  "no-analytics": {
    title: "No analytics data",
    description: "Charts will populate once tasks and sprints have enough history.",
  },
};

export interface ProjectEmptyStateProps {
  variant?: ProjectEmptyVariant;
  action?: React.ReactNode;
}

function ProjectEmptyState({ variant = "no-projects", action }: ProjectEmptyStateProps) {
  const copy = COPY[variant];
  return (
    <FeatureEmptyState
      variant={variant === "no-results" ? "no-results" : "no-data"}
      title={copy.title}
      description={copy.description}
      action={
        action ??
        (copy.showCreate ? (
          <PermissionGuard permission="project.create">
            <Button render={<Link href={routes.app.projectNew} />}>Create project</Button>
          </PermissionGuard>
        ) : undefined)
      }
    />
  );
}

export { ProjectEmptyState };
