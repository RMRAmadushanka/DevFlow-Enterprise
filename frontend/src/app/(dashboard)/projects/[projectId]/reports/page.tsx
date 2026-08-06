"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { ProjectDetailShell } from "@/features/projects";
import {
  ReportSkeleton,
  SprintEmptyState,
  SprintReports,
  useSprint,
  useSprints,
} from "@/features/sprints";

export default function ProjectReportsPage() {
  const params = useParams<{ projectId: string }>();
  const { data: list, isLoading } = useSprints(params.projectId);
  const activeId = list?.current?.id ?? list?.completed[0]?.id;
  const { data: sprint, isLoading: detailLoading } = useSprint(activeId);

  return (
    <ProjectDetailShell projectId={params.projectId} sidePanel={false}>
      {(project) => (
        <PageContainer className="flex flex-col gap-6 px-0">
          <PageHeader
            title="Sprint reports"
            description={`Burndown, velocity, and capacity for ${project.name}.`}
            breadcrumbs={[
              { label: "Projects", href: routes.app.projects },
              { label: project.name, href: routes.app.project(project.id) },
              { label: "Reports" },
            ]}
          />
          {isLoading || detailLoading ? (
            <ReportSkeleton />
          ) : sprint ? (
            <React.Suspense fallback={<ReportSkeleton />}>
              <SprintReports sprint={sprint} />
            </React.Suspense>
          ) : (
            <SprintEmptyState variant="no-reports" />
          )}
        </PageContainer>
      )}
    </ProjectDetailShell>
  );
}
