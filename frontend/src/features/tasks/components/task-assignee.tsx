"use client";

import { UserAvatar } from "@/components/data-display/avatars";
import { cn } from "@/lib/utils";

import type { TaskUser } from "../types/task.types";

export interface TaskAssigneeProps {
  assignee?: TaskUser;
  showName?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

function toAvatarUser(user: TaskUser) {
  return { id: user.id, name: user.name, imageUrl: user.avatarUrl };
}

function TaskAssignee({ assignee, showName = true, size = "sm", className }: TaskAssigneeProps) {
  if (!assignee) {
    return showName ? (
      <span className={cn("text-sm text-muted-foreground", className)}>Unassigned</span>
    ) : null;
  }

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <UserAvatar user={toAvatarUser(assignee)} size={size} />
      {showName ? (
        <span className="truncate text-sm text-foreground">{assignee.name}</span>
      ) : null}
    </span>
  );
}

export { TaskAssignee };
