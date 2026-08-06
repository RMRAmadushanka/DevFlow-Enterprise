"use client";

import { Eye, EyeOff, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import { useToggleTaskWatch } from "../hooks/use-tasks";
import type { TaskUser } from "../types/task.types";
import { TaskAvatarGroup } from "./task-avatar-group";

export interface TaskWatcherListProps {
  taskId: string;
  watchers: TaskUser[];
  watching?: boolean;
}

function TaskWatcherList({ taskId, watchers, watching }: TaskWatcherListProps) {
  const toggleWatch = useToggleTaskWatch();

  return (
    <div className="space-y-3" data-slot="task-watcher-list">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Watchers</h3>
        <PermissionGuard permission="task.update">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void toggleWatch.mutateAsync(taskId)}
          >
            {watching ? (
              <>
                <EyeOff className="size-4" />
                Unwatch
              </>
            ) : (
              <>
                <Eye className="size-4" />
                Watch
              </>
            )}
          </Button>
        </PermissionGuard>
      </div>

      {watchers.length > 0 ? (
        <TaskAvatarGroup users={watchers} max={8} />
      ) : (
        <p className="text-sm text-muted-foreground">No watchers yet.</p>
      )}

      <PermissionGuard permission="task.update">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => void toggleWatch.mutateAsync(taskId)}
        >
          <UserPlus className="size-4" />
          {watching ? "Remove yourself" : "Add yourself as watcher"}
        </Button>
      </PermissionGuard>
    </div>
  );
}

export { TaskWatcherList };
