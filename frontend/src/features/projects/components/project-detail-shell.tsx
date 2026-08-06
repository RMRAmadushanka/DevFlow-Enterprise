"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Pencil, Settings } from "lucide-react";

import { DetailPageTemplate } from "@/components/layout/page-templates";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useProject } from "../hooks/use-projects";
import type { Project } from "../types/project.types";
import { DuplicateProjectModal } from "./duplicate-project-modal";
import { ProjectArchiveModal } from "./project-archive-modal";
import { ProjectDetailSkeleton } from "./project-skeleton";
import { ProjectHeader } from "./project-header";
import { ProjectHero } from "./project-hero";
import { ProjectSidebar } from "./project-sidebar";
import { getActiveProjectTab, getProjectDetailTabs } from "./project-tabs";

export interface ProjectDetailShellProps {
  projectId: string;
  children: (project: NonNullable<ReturnType<typeof useProject>["data"]>) => React.ReactNode;
  sidePanel?: boolean;
}

function ProjectDetailShell({ projectId, children, sidePanel = true }: ProjectDetailShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: project, isLoading, isError } = useProject(projectId);
  const [archiveTarget, setArchiveTarget] = React.useState<Project | null>(null);
  const [duplicateTarget, setDuplicateTarget] = React.useState<Project | null>(null);

  const tabs = React.useMemo(() => getProjectDetailTabs(projectId), [projectId]);
  const activeTab = getActiveProjectTab(pathname, projectId);

  if (isLoading) {
    return (
      <div className="p-6">
        <ProjectDetailSkeleton />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Project not found"
        description="This project may have been deleted or you no longer have access."
        action={
          <Button render={<Link href={routes.app.projects} />}>Back to projects</Button>
        }
      />
    );
  }

  return (
    <>
      <DetailPageTemplate
        title={project.name}
        description={project.description}
        breadcrumbs={[
          { label: "Projects", href: routes.app.projects },
          { label: project.name },
        ]}
        status={
          <span className="sr-only">
            {project.status}, {project.health}
          </span>
        }
        actions={
          <>
            <PermissionGuard permission="project.update">
              <Button render={<Link href={routes.app.projectEdit(project.id)} />} variant="outline">
                <Pencil className="size-4" />
                Edit
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="project.update">
              <Button
                render={<Link href={routes.app.projectSettings(project.id)} />}
                variant="outline"
              >
                <Settings className="size-4" />
                Settings
              </Button>
            </PermissionGuard>
          </>
        }
        tabs={tabs.map(({ value, label }) => ({ value, label }))}
        activeTab={activeTab}
        onTabChange={(value) => {
          const next = tabs.find((tab) => tab.value === value);
          if (next) router.push(next.href);
        }}
        sidePanel={sidePanel ? <ProjectSidebar project={project} /> : undefined}
      >
        <div className="flex flex-col gap-6">
          <ProjectHeader
            project={project}
            onArchive={setArchiveTarget}
            onDuplicate={setDuplicateTarget}
          />
          {activeTab === "overview" ? <ProjectHero project={project} /> : null}
          {children(project)}
        </div>
      </DetailPageTemplate>

      <ProjectArchiveModal
        project={archiveTarget}
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      />
      <DuplicateProjectModal
        project={duplicateTarget}
        open={Boolean(duplicateTarget)}
        onOpenChange={(open) => {
          if (!open) setDuplicateTarget(null);
        }}
      />
    </>
  );
}

export { ProjectDetailShell };
