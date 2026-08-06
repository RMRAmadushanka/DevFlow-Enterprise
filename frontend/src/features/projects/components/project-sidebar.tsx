"use client";

import Link from "next/link";
import { CalendarDays, GitBranch, Globe, Tag, Users } from "lucide-react";

import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

import type { Project, ProjectDetail } from "../types/project.types";
import { ProjectHealthCard } from "./project-health-card";
import { ProjectStatusBadge } from "./project-status-badge";

export interface ProjectSidebarProps {
  project: Project | ProjectDetail;
  className?: string;
}

function SidebarRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-foreground">{children}</div>
      </div>
    </div>
  );
}

function ProjectSidebar({ project, className }: ProjectSidebarProps) {
  const detail = "statistics" in project ? project : null;

  return (
    <aside
      className={cn("flex flex-col gap-5 rounded-xl border border-border bg-card p-5", className)}
      data-slot="project-sidebar"
    >
      <div className="flex flex-wrap items-center gap-2">
        <ProjectStatusBadge status={project.status} />
        <ProjectHealthCard health={project.health} compact />
      </div>

      <div className="space-y-4">
        <SidebarRow icon={Users} label="Owner">
          {project.ownerName}
        </SidebarRow>
        <SidebarRow icon={Users} label="Members">
          {project.memberCount}
        </SidebarRow>
        <SidebarRow icon={Globe} label="Visibility">
          <span className="capitalize">{project.visibility}</span>
        </SidebarRow>
        <SidebarRow icon={Globe} label="Timezone">
          {project.timezone}
        </SidebarRow>
        {project.repositoryUrl ? (
          <SidebarRow icon={GitBranch} label="Repository">
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {project.defaultBranch}
            </a>
          </SidebarRow>
        ) : null}
        {project.language ? (
          <SidebarRow icon={Tag} label="Primary language">
            {project.language}
          </SidebarRow>
        ) : null}
        <SidebarRow icon={CalendarDays} label="Last activity">
          {formatRelativeTime(project.lastActivityAt)}
        </SidebarRow>
        <SidebarRow icon={CalendarDays} label="Created">
          {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
            new Date(project.createdAt)
          )}
        </SidebarRow>
      </div>

      {project.technologyStack.length > 0 ? (
        <div>
          <p className="text-xs text-muted-foreground">Technology</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {project.technologyStack.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {project.tags.length > 0 ? (
        <div>
          <p className="text-xs text-muted-foreground">Tags</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {detail ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <p className="text-xs text-muted-foreground">Quick stats</p>
          <dl className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <dt className="text-xs text-muted-foreground">Tasks</dt>
              <dd className="font-medium">{detail.statistics.totalTasks}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Velocity</dt>
              <dd className="font-medium">{detail.statistics.velocity}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 pt-2">
        <Button render={<Link href={routes.app.projectSettings(project.id)} />} variant="outline" size="sm">
          Project settings
        </Button>
        <Button render={<Link href={routes.app.projectMembers(project.id)} />} variant="ghost" size="sm">
          Manage members
        </Button>
      </div>
    </aside>
  );
}

export { ProjectSidebar };
