"use client";

import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { ProjectDetailShell } from "@/features/projects";
import { ReleaseTimeline, SprintSkeleton, useReleases } from "@/features/sprints";

export default function ProjectReleasesPage() {
  const params = useParams<{ projectId: string }>();
  const { data: releases = [], isLoading } = useReleases(params.projectId);

  return (
    <ProjectDetailShell projectId={params.projectId} sidePanel={false}>
      {(project) => (
        <PageContainer className="flex flex-col gap-6 px-0">
          <PageHeader
            title="Releases"
            description={`Release planning for ${project.name}.`}
            breadcrumbs={[
              { label: "Projects", href: routes.app.projects },
              { label: project.name, href: routes.app.project(project.id) },
              { label: "Releases" },
            ]}
          />
          {isLoading ? <SprintSkeleton /> : <ReleaseTimeline releases={releases} />}
        </PageContainer>
      )}
    </ProjectDetailShell>
  );
}
