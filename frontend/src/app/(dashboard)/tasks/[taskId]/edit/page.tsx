"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { DrawerSkeleton, TaskForm, useTask } from "@/features/tasks";

export default function EditTaskPage() {
  const params = useParams<{ taskId: string }>();
  const { data: task, isLoading, isError } = useTask(params.taskId);

  if (isLoading) {
    return (
      <PageContainer className="p-6">
        <DrawerSkeleton />
      </PageContainer>
    );
  }

  if (isError || !task) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Task not found"
        description="This task may have been deleted or you no longer have access."
        action={
          <Button render={<Link href={routes.app.tasks} />}>Back to tasks</Button>
        }
      />
    );
  }

  return (
    <PageContainer className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={`Edit ${task.key}`}
        description={task.title}
        breadcrumbs={[
          { label: "Tasks", href: routes.app.tasks },
          { label: task.key, href: routes.app.task(task.id) },
          { label: "Edit" },
        ]}
        actions={
          <Button render={<Link href={routes.app.task(task.id)} />} variant="outline">
            Cancel
          </Button>
        }
      />
      <TaskForm mode="edit" task={task} />
    </PageContainer>
  );
}
