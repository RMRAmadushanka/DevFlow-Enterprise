"use client";

import { Server } from "lucide-react";

import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";
import { DashboardSection } from "@/components/dashboard";
import { cn } from "@/lib/utils";

import type { ProjectEnvironment } from "../types/project.types";
import { ProjectHealthCard } from "./project-health-card";
import { FeatureEmptyState } from "@/components/architecture/empty";

const ENV_STATUS_TONE: Record<ProjectEnvironment["status"], Tone> = {
  healthy: "success",
  degraded: "warning",
  down: "danger",
  idle: "neutral",
};

const ENV_LABELS: Record<ProjectEnvironment["name"], string> = {
  development: "Development",
  testing: "Testing",
  staging: "Staging",
  production: "Production",
};

export interface ProjectEnvironmentCardProps {
  environment: ProjectEnvironment;
  className?: string;
}

function ProjectEnvironmentCard({ environment, className }: ProjectEnvironmentCardProps) {
  return (
    <article
      className={cn("rounded-xl border border-border bg-card p-4", className)}
      data-slot="project-environment-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Server className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-foreground">{ENV_LABELS[environment.name]}</p>
            <p className="text-xs text-muted-foreground capitalize">{environment.name}</p>
          </div>
        </div>
        <StatusBadge tone={ENV_STATUS_TONE[environment.status]} size="sm" dot>
          {environment.status}
        </StatusBadge>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ProjectHealthCard health={environment.health} compact />
        {environment.version ? (
          <span className="text-xs text-muted-foreground">v{environment.version}</span>
        ) : null}
      </div>
      {environment.latestDeployment ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Last deployed {formatRelativeTime(environment.latestDeployment)}
        </p>
      ) : null}
      <p className="mt-1 text-xs text-muted-foreground">
        Updated {formatRelativeTime(environment.updatedAt)}
      </p>
    </article>
  );
}

export interface ProjectEnvironmentsListProps {
  environments: ProjectEnvironment[];
  title?: string;
  className?: string;
}

function ProjectEnvironmentsList({
  environments,
  title = "Environments",
  className,
}: ProjectEnvironmentsListProps) {
  if (environments.length === 0) {
    return (
      <FeatureEmptyState
        variant="no-data"
        title="No environments"
        description="Deployment environments will appear here once configured."
      />
    );
  }

  return (
    <DashboardSection title={title} className={className}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-slot="project-environments-list">
        {environments.map((environment) => (
          <ProjectEnvironmentCard key={environment.id} environment={environment} />
        ))}
      </div>
    </DashboardSection>
  );
}

export { ProjectEnvironmentCard, ProjectEnvironmentsList };
