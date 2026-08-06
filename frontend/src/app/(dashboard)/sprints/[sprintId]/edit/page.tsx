"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { SprintForm, SprintSkeleton, useSprint } from "@/features/sprints";

export default function EditSprintPage() {
  const params = useParams<{ sprintId: string }>();
  const { data: sprint, isLoading, isError } = useSprint(params.sprintId);

  if (isLoading) {
    return (
      <PageContainer className="p-6">
        <SprintSkeleton />
      </PageContainer>
    );
  }

  if (isError || !sprint) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Sprint not found"
        description="This sprint may have been deleted or you no longer have access."
        action={
          <Button render={<Link href={routes.app.sprints} />}>Back to sprints</Button>
        }
      />
    );
  }

  return (
    <PageContainer className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={`Edit ${sprint.name}`}
        description={sprint.goal}
        breadcrumbs={[
          { label: "Sprints", href: routes.app.sprints },
          { label: sprint.name, href: routes.app.sprint(sprint.id) },
          { label: "Edit" },
        ]}
        actions={
          <Button render={<Link href={routes.app.sprint(sprint.id)} />} variant="outline">
            Cancel
          </Button>
        }
      />
      <SprintForm mode="edit" sprint={sprint} />
    </PageContainer>
  );
}
