"use client";

import { useParams } from "next/navigation";

import { ProjectDetailShell } from "@/features/projects";
import { TasksView } from "@/features/tasks";

export default function ProjectTasksPage() {
  const params = useParams<{ projectId: string }>();

  return (
    <ProjectDetailShell projectId={params.projectId} sidePanel={false}>
      {(project) => (
        <TasksView
          projectId={project.id}
          title={`${project.name} tasks`}
          description="Tasks scoped to this project."
        />
      )}
    </ProjectDetailShell>
  );
}
