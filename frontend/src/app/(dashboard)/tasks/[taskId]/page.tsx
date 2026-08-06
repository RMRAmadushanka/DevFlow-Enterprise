"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";
import {
  DrawerSkeleton,
  PriorityBadge,
  SubTaskList,
  TaskActivityTimeline,
  TaskAttachments,
  TaskChecklist,
  TaskComments,
  TaskHistory,
  TaskRelationCard,
  TaskStatusBadge,
  TaskWatcherList,
  TimeTrackingCard,
  useTask,
  useTaskStore,
} from "@/features/tasks";

export default function TaskDetailPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();
  const { data: task, isLoading, isError } = useTask(params.taskId);
  const setActiveTaskId = useTaskStore((s) => s.setActiveTaskId);

  React.useEffect(() => {
    // Prefer drawer UX on list; keep full page as deep-link target.
    setActiveTaskId(null);
  }, [setActiveTaskId]);

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
    <PageContainer className="flex flex-col gap-6">
      <PageHeader
        title={task.title}
        description={`${task.key} · ${task.projectName}`}
        breadcrumbs={[
          { label: "Tasks", href: routes.app.tasks },
          { label: task.key },
        ]}
        actions={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(routes.app.tasks)}
            >
              Open board
            </Button>
            <PermissionGuard permission="task.update">
              <Button render={<Link href={routes.app.taskEdit(task.id)} />} variant="outline">
                <Pencil className="size-4" />
                Edit
              </Button>
            </PermissionGuard>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-base font-semibold">Overview</h2>
            <div
              className="prose prose-sm mt-3 max-w-none text-muted-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: task.description || "<p>No description</p>",
              }}
            />
          </section>
          <TaskChecklist taskId={task.id} items={task.checklist} />
          <SubTaskList subtasks={task.subtasks} />
          <TaskComments taskId={task.id} />
          <TaskAttachments taskId={task.id} attachments={task.attachments} />
          <TaskActivityTimeline items={task.activity} />
        </div>
        <div className="space-y-6">
          <TimeTrackingCard timeTracking={task.timeTracking} />
          <TaskRelationCard relations={task.relations} />
          <TaskWatcherList taskId={task.id} watchers={task.watchers} watching={task.watching} />
          <TaskHistory items={task.history} />
        </div>
      </div>
    </PageContainer>
  );
}
