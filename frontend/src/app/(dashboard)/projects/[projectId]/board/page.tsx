"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { ProjectDetailShell } from "@/features/projects";
import { TasksView, useTaskStore } from "@/features/tasks";

export default function ProjectBoardPage() {
  const params = useParams<{ projectId: string }>();
  const setViewMode = useTaskStore((s) => s.setViewMode);

  React.useEffect(() => {
    setViewMode("board");
  }, [setViewMode]);

  return (
    <ProjectDetailShell projectId={params.projectId} sidePanel={false}>
      {(project) => (
        <TasksView
          projectId={project.id}
          title={`${project.name} board`}
          description="Kanban board for this project."
        />
      )}
    </ProjectDetailShell>
  );
}
