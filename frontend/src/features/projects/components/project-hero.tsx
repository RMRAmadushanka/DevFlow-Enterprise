"use client";

import { CalendarDays, GitBranch, Globe, Users } from "lucide-react";

import { ProgressBar } from "@/components/data-display/progress";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { Project } from "../types/project.types";
import { ProjectHealthCard } from "./project-health-card";
import { ProjectStatusBadge } from "./project-status-badge";

export interface ProjectHeroProps {
  project: Project;
  className?: string;
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  );
}

function ProjectHero({ project, className }: ProjectHeroProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-5 sm:p-6",
        className
      )}
      data-slot="project-hero"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            <ProjectHealthCard health={project.health} compact />
            {project.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Overall progress</span>
              <span className="tabular-nums text-muted-foreground">{project.progress}%</span>
            </div>
            <ProgressBar
              value={project.progress}
              aria-label={`${project.name} overall progress`}
            />
            <p className="text-xs text-muted-foreground">
              {project.completedTaskCount} of {project.taskCount} tasks completed
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[22rem]">
          <MetaItem icon={Users} label="Owner" value={project.ownerName} />
          <MetaItem icon={Users} label="Members" value={project.memberCount} />
          <MetaItem icon={Globe} label="Timezone" value={project.timezone} />
          {project.repositoryUrl ? (
            <MetaItem icon={GitBranch} label="Branch" value={project.defaultBranch} />
          ) : null}
          {project.startDate ? (
            <MetaItem
              icon={CalendarDays}
              label="Started"
              value={new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                new Date(project.startDate)
              )}
            />
          ) : null}
          <MetaItem
            icon={CalendarDays}
            label="Updated"
            value={formatRelativeTime(project.updatedAt)}
          />
        </div>
      </div>
    </section>
  );
}

export { ProjectHero };
