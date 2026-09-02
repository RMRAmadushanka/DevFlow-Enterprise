"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";
import { ProjectDetailShell } from "@/features/projects";
import {
  ReleaseFormModal,
  ReleaseTimeline,
  SprintSkeleton,
  useReleases,
  type Release,
} from "@/features/sprints";

export default function ProjectReleasesPage() {
  const params = useParams<{ projectId: string }>();
  const { data: releases = [], isLoading } = useReleases(params.projectId);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Release | null>(null);

  return (
    <ProjectDetailShell projectId={params.projectId} sidePanel={false}>
      {(project) => (
        <PageContainer className="flex flex-col gap-6 px-0">
          <PageHeader
            title="Releases"
            description={`Release planning for ${project.name}.`}
            breadcrumbs={[
              { label: "Projects", href: routes.app.projects },
              { label: project.name, href: routes.app.project(project.id) },
              { label: "Releases" },
            ]}
            actions={
              <PermissionGuard permission="sprint.create">
                <Button type="button" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-4" />
                  New release
                </Button>
              </PermissionGuard>
            }
          />
          {isLoading ? (
            <SprintSkeleton />
          ) : (
            <ReleaseTimeline releases={releases} onEdit={setEditTarget} />
          )}

          <ReleaseFormModal
            key="create"
            mode="create"
            defaultProjectId={project.id}
            open={createOpen}
            onOpenChange={setCreateOpen}
          />
          <ReleaseFormModal
            key={editTarget?.id ?? "edit"}
            mode="edit"
            release={editTarget}
            open={Boolean(editTarget)}
            onOpenChange={(open) => {
              if (!open) setEditTarget(null);
            }}
          />
        </PageContainer>
      )}
    </ProjectDetailShell>
  );
}
