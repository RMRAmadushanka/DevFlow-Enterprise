"use client";

import Link from "next/link";
import {
  Archive,
  ArrowRightLeft,
  Copy,
  Eye,
  Link2,
  MoreHorizontal,
  Pencil,
  Star,
} from "lucide-react";

import { toast } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import {
  useArchiveTask,
  useDuplicateTask,
  useToggleTaskFavorite,
  useToggleTaskWatch,
} from "../hooks/use-tasks";
import type { Task } from "../types/task.types";

export interface TaskQuickActionsProps {
  task: Task;
  onMove?: (task: Task) => void;
  onArchive?: (task: Task) => void;
  compact?: boolean;
}

function TaskQuickActions({ task, onMove, onArchive, compact }: TaskQuickActionsProps) {
  const toggleFavorite = useToggleTaskFavorite();
  const toggleWatch = useToggleTaskWatch();
  const duplicate = useDuplicateTask();
  const archive = useArchiveTask();

  async function copyLink() {
    const url = `${window.location.origin}${routes.app.task(task.id)}`;
    await navigator.clipboard.writeText(url);
    toast.success("Task link copied");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            size={compact ? "icon-sm" : "icon-sm"}
            variant="ghost"
            aria-label={`Actions for ${task.title}`}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void toggleFavorite.mutateAsync(task.id)}>
          <Star className="size-4" />
          {task.favorite ? "Unfavorite" : "Favorite"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void toggleWatch.mutateAsync(task.id)}>
          <Eye className="size-4" />
          {task.watching ? "Unwatch" : "Watch"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void copyLink()}>
          <Link2 className="size-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <PermissionGuard permission="task.create">
          <DropdownMenuItem onClick={() => void duplicate.mutateAsync(task.id)}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard permission="task.update">
          <DropdownMenuItem onClick={() => onMove?.(task)}>
            <ArrowRightLeft className="size-4" />
            Move
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={routes.app.taskEdit(task.id)} />}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard permission="task.update">
          <DropdownMenuItem
            onClick={() => {
              if (onArchive) {
                onArchive(task);
              } else {
                void archive.mutateAsync(task.id);
              }
            }}
          >
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { TaskQuickActions };
