"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ProjectDetailSkeleton, ProjectForm, useProject } from "@/features/projects";

export default function EditProjectPage() {
  const params = useParams<{ projectId: string }>();
  const { data: project, isLoading, isError } = useProject(params.projectId);

  if (isLoading) {
    return (
      <PageContainer className="p-6">
        <ProjectDetailSkeleton />
      </PageContainer>
    );
  }

  if (isError || !project) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Project not found"
        description="This project may have been deleted or you no longer have access."
        action={
          <Button render={<Link href={routes.app.projects} />}>Back to projects</Button>
        }
      />
    );
  }

  return (
    <PageContainer className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={`Edit ${project.name}`}
        description="Update project configuration and metadata."
        breadcrumbs={[
          { label: "Projects", href: routes.app.projects },
          { label: project.name, href: routes.app.project(project.id) },
          { label: "Edit" },
        ]}
        actions={
          <Button render={<Link href={routes.app.project(project.id)} />} variant="outline">
            Cancel
          </Button>
        }
      />
      <ProjectForm mode="edit" project={project} />
    </PageContainer>
  );
}
