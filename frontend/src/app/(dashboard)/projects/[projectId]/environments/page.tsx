"use client";

import { useParams } from "next/navigation";

import { ProjectDetailShell, ProjectEnvironmentsList } from "@/features/projects";

export default function ProjectEnvironmentsPage() {
  const params = useParams<{ projectId: string }>();

  return (
    <ProjectDetailShell projectId={params.projectId}>
      {(project) => <ProjectEnvironmentsList environments={project.environments} />}
    </ProjectDetailShell>
  );
}
