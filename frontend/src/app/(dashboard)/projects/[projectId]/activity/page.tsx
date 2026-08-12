"use client";

import { useParams } from "next/navigation";

import {
  ProjectDetailShell,
  ProjectEmptyState,
  ProjectTimeline,
  useProjectActivity,
} from "@/features/projects";

export default function ProjectActivityPage() {
  const params = useParams<{ projectId: string }>();
  const activityQuery = useProjectActivity(params.projectId);

  return (
    <ProjectDetailShell projectId={params.projectId}>
      {() => {
        if (activityQuery.isLoading) {
          return <div className="h-48 animate-pulse rounded-xl bg-muted" aria-busy="true" />;
        }
        const items = activityQuery.data?.items ?? [];
        if (items.length === 0) {
          return <ProjectEmptyState variant="no-activity" />;
        }
        return <ProjectTimeline items={items} />;
      }}
    </ProjectDetailShell>
  );
}
