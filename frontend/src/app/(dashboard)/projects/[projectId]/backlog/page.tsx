"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";
import { ProjectDetailShell } from "@/features/projects";
import {
  BacklogBoard,
  MoveTaskToSprintModal,
  useBacklog,
  useSprintStore,
} from "@/features/sprints";

export default function ProjectBacklogPage() {
  const params = useParams<{ projectId: string }>();
  const q = useSprintStore((s) => s.filters.q);
  const selectedIds = useSprintStore((s) => s.selectedBacklogIds);
  const { data: items = [], isLoading } = useBacklog(params.projectId, q);
  const [moveOpen, setMoveOpen] = React.useState(false);

  return (
    <ProjectDetailShell projectId={params.projectId} sidePanel={false}>
      {(project) => (
        <PageContainer className="flex flex-col gap-6 px-0">
          <PageHeader
            title="Product backlog"
            description={`Unplanned work for ${project.name}.`}
            breadcrumbs={[
              { label: "Projects", href: routes.app.projects },
              { label: project.name, href: routes.app.project(project.id) },
              { label: "Backlog" },
            ]}
          />
          <BacklogBoard
            projectId={project.id}
            items={items}
            loading={isLoading}
            onMoveToSprint={() => setMoveOpen(true)}
          />
          <MoveTaskToSprintModal
            open={moveOpen}
            onOpenChange={setMoveOpen}
            projectId={project.id}
            taskIds={selectedIds}
          />
        </PageContainer>
      )}
    </ProjectDetailShell>
  );
}
