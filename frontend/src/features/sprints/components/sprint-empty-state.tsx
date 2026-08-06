"use client";

import Link from "next/link";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

export type SprintEmptyVariant =
  | "no-sprint"
  | "no-backlog"
  | "no-reports"
  | "no-releases"
  | "no-results";

const COPY: Record<
  SprintEmptyVariant,
  { title: string; description: string; showCreate?: boolean; featureVariant: "no-data" | "no-results" | "first-time" }
> = {
  "no-sprint": {
    title: "No sprints yet",
    description: "Create your first sprint to start planning and tracking iterations.",
    showCreate: true,
    featureVariant: "first-time",
  },
  "no-backlog": {
    title: "Backlog is empty",
    description: "Add tasks to the backlog before planning your next sprint.",
    featureVariant: "no-data",
  },
  "no-reports": {
    title: "No report data",
    description: "Reports appear once a sprint has started and work is tracked.",
    featureVariant: "no-data",
  },
  "no-releases": {
    title: "No releases",
    description: "Create a release to group sprints and track shipped versions.",
    featureVariant: "no-data",
  },
  "no-results": {
    title: "No matching sprints",
    description: "Try adjusting search or filters to find what you need.",
    featureVariant: "no-results",
  },
};

export interface SprintEmptyStateProps {
  variant?: SprintEmptyVariant;
  action?: React.ReactNode;
}

function SprintEmptyState({ variant = "no-sprint", action }: SprintEmptyStateProps) {
  const copy = COPY[variant];
  return (
    <FeatureEmptyState
      variant={copy.featureVariant}
      title={copy.title}
      description={copy.description}
      action={
        action ??
        (copy.showCreate ? (
          <PermissionGuard permission="sprint.create">
            <Button render={<Link href={routes.app.sprintNew} />}>Create sprint</Button>
          </PermissionGuard>
        ) : undefined)
      }
    />
  );
}

export { SprintEmptyState };
