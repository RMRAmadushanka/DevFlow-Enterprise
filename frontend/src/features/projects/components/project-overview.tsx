"use client";

import Link from "next/link";
import { GitBranch, Rocket, Users } from "lucide-react";

import { DashboardSection } from "@/components/dashboard";
import { UserAvatarGroup } from "@/components/data-display/avatars";
import { ProgressBar } from "@/components/data-display/progress";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import type { ProjectDetail } from "../types/project.types";
import { ProjectActivity } from "./project-activity";
import { ProjectHealthCard } from "./project-health-card";
import { ProjectMilestones } from "./project-milestones";
import { ProjectRepositoryCard } from "./project-repository-card";
import { ProjectStatistics } from "./project-statistics";

export interface ProjectOverviewProps {
  project: ProjectDetail;
  loading?: boolean;
}

function ProjectOverview({ project, loading }: ProjectOverviewProps) {
  const teamAvatars = project.members.slice(0, 5).map((member) => ({
    name: member.name,
    imageUrl: member.avatarUrl,
  }));

  return (
    <div className="flex flex-col gap-8" data-slot="project-overview">
      <ProjectStatistics statistics={project.statistics} loading={loading} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <DashboardSection title="Delivery progress">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Overall completion</span>
                <span className="tabular-nums text-muted-foreground">{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} />
              <p className="text-xs text-muted-foreground">
                Sprint progress at {project.statistics.sprintProgress}%
              </p>
            </div>
          </DashboardSection>

          <DashboardSection
            title="Milestones"
            actions={
              <Button
                render={<Link href={routes.app.project(project.id)} />}
                variant="ghost"
                size="sm"
              >
                View all
              </Button>
            }
          >
            <ProjectMilestones milestones={project.milestones.slice(0, 4)} />
          </DashboardSection>

          <DashboardSection title="Recent activity">
            <div className="rounded-xl border border-border bg-card px-4">
              <ProjectActivity items={project.activity} limit={6} />
            </div>
          </DashboardSection>
        </div>

        <div className="space-y-6">
          <ProjectHealthCard
            health={project.health}
            score={project.analytics.healthScore}
          />

          <DashboardSection
            title="Team"
            actions={
              <Button
                render={<Link href={routes.app.projectMembers(project.id)} />}
                variant="ghost"
                size="sm"
              >
                Manage
              </Button>
            }
          >
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" aria-hidden />
                  {project.memberCount} members
                </span>
                <UserAvatarGroup users={teamAvatars} max={5} size="sm" />
              </div>
              <ul className="space-y-2">
                {project.members.slice(0, 4).map((member) => (
                  <li key={member.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-foreground">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </DashboardSection>

          {project.repository ? (
            <DashboardSection
              title="Repository"
              actions={
                <Button
                  render={<Link href={routes.app.projectRepository(project.id)} />}
                  variant="ghost"
                  size="sm"
                >
                  Details
                </Button>
              }
            >
              <ProjectRepositoryCard repository={project.repository} compact />
            </DashboardSection>
          ) : null}

          {project.upcomingReleases.length > 0 ? (
            <DashboardSection title="Upcoming releases">
              <ul className="flex flex-col gap-2">
                {project.upcomingReleases.slice(0, 3).map((release) => (
                  <li
                    key={release.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="inline-flex items-center gap-2 font-medium text-foreground">
                      <Rocket className="size-4 text-muted-foreground" aria-hidden />
                      {release.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{release.status}</span>
                  </li>
                ))}
              </ul>
            </DashboardSection>
          ) : null}

          {project.repositoryUrl ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Default branch</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <GitBranch className="size-4 text-muted-foreground" aria-hidden />
                {project.defaultBranch}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { ProjectOverview };
