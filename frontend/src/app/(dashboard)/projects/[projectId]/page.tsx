"use client";

import { useParams } from "next/navigation";

import { ProjectDetailShell, ProjectOverview } from "@/features/projects";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();

  return (
    <ProjectDetailShell projectId={params.projectId}>
      {(project) => <ProjectOverview project={project} />}
    </ProjectDetailShell>
  );
}
