"use client";

import { useParams } from "next/navigation";

import { ProjectDetailShell } from "@/features/projects";
import { SprintsView } from "@/features/sprints";

export default function ProjectSprintsPage() {
  const params = useParams<{ projectId: string }>();

  return (
    <ProjectDetailShell projectId={params.projectId} sidePanel={false}>
      {(project) => (
        <SprintsView
          projectId={project.id}
          title={`${project.name} sprints`}
          description="Plan and track iterations for this project."
        />
      )}
    </ProjectDetailShell>
  );
}
