"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { AnalyticsSkeleton, ProjectAnalyticsView, ProjectDetailShell } from "@/features/projects";

export default function ProjectAnalyticsPage() {
  const params = useParams<{ projectId: string }>();

  return (
    <ProjectDetailShell projectId={params.projectId}>
      {(project) => (
        <React.Suspense fallback={<AnalyticsSkeleton />}>
          <ProjectAnalyticsView analytics={project.analytics} />
        </React.Suspense>
      )}
    </ProjectDetailShell>
  );
}
