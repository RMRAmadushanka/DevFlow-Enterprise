"use client";

import { useParams } from "next/navigation";

import { ProjectDetailShell, ProjectTimeline } from "@/features/projects";

export default function ProjectActivityPage() {
  const params = useParams<{ projectId: string }>();

  return (
    <ProjectDetailShell projectId={params.projectId}>
      {(project) => <ProjectTimeline items={project.activity} />}
    </ProjectDetailShell>
  );
}
