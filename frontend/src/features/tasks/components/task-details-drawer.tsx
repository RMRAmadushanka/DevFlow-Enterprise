"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  Clock,
  History,
  Link2,
  MessageSquare,
  Paperclip,
  Pencil,
} from "lucide-react";

import { DetailDrawer } from "@/components/feedback/drawer";
import { Tabs } from "@/components/navigation/tabs";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useTask } from "../hooks/use-tasks";
import type { Task, TaskDetail } from "../types/task.types";
import { LabelBadge } from "./label-badge";
import { PriorityBadge } from "./priority-badge";
import { SubTaskList } from "./sub-task-list";
import { TaskActivityTimeline } from "./task-activity-timeline";
import { TaskAssignee } from "./task-assignee";
import { TaskAttachments } from "./task-attachments";
import { TaskChecklist } from "./task-checklist";
import { TaskComments } from "./task-comments";
import { TaskHistory } from "./task-history";
import { TaskQuickActions } from "./task-quick-actions";
import { TaskRelationCard } from "./task-relation-card";
import { DrawerSkeleton } from "./task-skeleton";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskWatcherList } from "./task-watcher-list";
import { TimeTrackingCard } from "./time-tracking-card";

export interface TaskDetailsDrawerProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMove?: (task: Task) => void;
  onArchive?: (task: Task) => void;
  onSelectTask?: (task: Task) => void;
}

function OverviewSection({ task }: { task: TaskDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <TaskStatusBadge status={task.status} size="md" />
        <PriorityBadge priority={task.priority} />
        {task.labels.map((label) => (
          <LabelBadge key={label.id} label={label} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{task.description || "No description."}</p>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Project</dt>
          <dd className="text-sm font-medium">{task.projectName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Sprint</dt>
          <dd className="text-sm font-medium">{task.sprintName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Assignee</dt>
          <dd><TaskAssignee assignee={task.assignee} /></dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Reporter</dt>
          <dd><TaskAssignee assignee={task.reporter} /></dd>
        </div>
        {task.dueDate ? (
          <div>
            <dt className="text-xs text-muted-foreground">Due date</dt>
            <dd className="inline-flex items-center gap-1 text-sm font-medium">
              <Calendar className="size-3.5" aria-hidden />
              {task.dueDate}
            </dd>
          </div>
        ) : null}
        {task.storyPoints != null ? (
          <div>
            <dt className="text-xs text-muted-foreground">Story points</dt>
            <dd className="text-sm font-medium tabular-nums">{task.storyPoints}</dd>
          </div>
        ) : null}
      </dl>
      {task.subtasks.length > 0 ? (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Subtasks</h4>
          <SubTaskList subtasks={task.subtasks} />
        </div>
      ) : null}
      <TaskWatcherList taskId={task.id} watchers={task.watchers} watching={task.watching} />
    </div>
  );
}

function TaskDetailsDrawer({
  taskId,
  open,
  onOpenChange,
  onMove,
  onArchive,
  onSelectTask,
}: TaskDetailsDrawerProps) {
  const { data: task, isLoading, isError } = useTask(taskId ?? undefined);
  const [tab, setTab] = React.useState("overview");

  React.useEffect(() => {
    if (open) setTab("overview");
  }, [open, taskId]);

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      size="full"
      title={
        task ? (
          <span className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-muted-foreground">{task.key}</span>
            <span className="text-base font-semibold">{task.title}</span>
          </span>
        ) : (
          "Task details"
        )
      }
      actions={
        task ? (
          <>
            <PermissionGuard permission="task.update">
              <Button render={<Link href={routes.app.taskEdit(task.id)} />} size="icon-sm" variant="ghost">
                <Pencil className="size-4" />
              </Button>
            </PermissionGuard>
            <TaskQuickActions task={task} onMove={onMove} onArchive={onArchive} />
          </>
        ) : null
      }
    >
      {isLoading ? (
        <DrawerSkeleton />
      ) : isError || !task ? (
        <p className="text-sm text-muted-foreground">Could not load task details.</p>
      ) : (
        <Tabs
          value={tab}
          onValueChange={setTab}
          variant="underline"
          items={[
            {
              value: "overview",
              label: "Overview",
              content: <OverviewSection task={task} />,
            },
            {
              value: "comments",
              label: "Comments",
              icon: <MessageSquare className="size-3.5" aria-hidden />,
              badge: task.commentCount || undefined,
              content: <TaskComments taskId={task.id} />,
            },
            {
              value: "activity",
              label: "Activity",
              content: <TaskActivityTimeline items={task.activity} />,
            },
            {
              value: "attachments",
              label: "Attachments",
              icon: <Paperclip className="size-3.5" aria-hidden />,
              badge: task.attachmentCount || undefined,
              content: (
                <TaskAttachments taskId={task.id} attachments={task.attachments} />
              ),
            },
            {
              value: "checklist",
              label: "Checklist",
              icon: <CheckSquare className="size-3.5" aria-hidden />,
              badge: task.checklistTotal || undefined,
              content: <TaskChecklist taskId={task.id} items={task.checklist} />,
            },
            {
              value: "time",
              label: "Time",
              icon: <Clock className="size-3.5" aria-hidden />,
              content: <TimeTrackingCard timeTracking={task.timeTracking} />,
            },
            {
              value: "linked",
              label: "Linked",
              icon: <Link2 className="size-3.5" aria-hidden />,
              badge: task.relations.length || undefined,
              content: (
                <TaskRelationCard
                  relations={task.relations}
                  onSelect={(relation) =>
                    onSelectTask?.({
                      id: relation.taskId,
                      key: relation.taskKey,
                      title: relation.taskTitle,
                    } as Task)
                  }
                />
              ),
            },
            {
              value: "history",
              label: "History",
              icon: <History className="size-3.5" aria-hidden />,
              content: <TaskHistory items={task.history} />,
            },
          ]}
        />
      )}
    </DetailDrawer>
  );
}

export { TaskDetailsDrawer };
