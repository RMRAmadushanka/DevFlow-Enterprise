"use client";

import Link from "next/link";
import {
  Archive,
  CheckCircle2,
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Play,
} from "lucide-react";

import { ExportButton } from "@/components/dashboard";
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
  useArchiveSprint,
  useCompleteSprint,
  useDuplicateSprint,
  useStartSprint,
} from "../hooks/use-sprints";
import type { Sprint } from "../types/sprint.types";

export interface SprintQuickActionsProps {
  sprint: Sprint;
  onComplete?: (sprint: Sprint) => void;
  onArchive?: (sprint: Sprint) => void;
  compact?: boolean;
}

function SprintQuickActions({
  sprint,
  onComplete,
  onArchive,
  compact,
}: SprintQuickActionsProps) {
  const start = useStartSprint();
  const complete = useCompleteSprint();
  const duplicate = useDuplicateSprint();
  const archive = useArchiveSprint();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={`Actions for ${sprint.name}`}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <PermissionGuard permission="sprint.update">
          {sprint.status === "planning" ? (
            <DropdownMenuItem onClick={() => void start.mutateAsync(sprint.id)}>
              <Play className="size-4" />
              Start sprint
            </DropdownMenuItem>
          ) : null}
          {sprint.status === "active" ? (
            <DropdownMenuItem
              onClick={() => {
                if (onComplete) {
                  onComplete(sprint);
                } else {
                  void complete.mutateAsync(sprint.id);
                }
              }}
            >
              <CheckCircle2 className="size-4" />
              Complete sprint
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem render={<Link href={routes.app.sprintEdit(sprint.id)} />}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard permission="sprint.create">
          <DropdownMenuItem onClick={() => void duplicate.mutateAsync(sprint.id)}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
        </PermissionGuard>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => toast.success("Sprint export started")}
        >
          <Download className="size-4" />
          Export
        </DropdownMenuItem>
        <PermissionGuard permission="sprint.update">
          <DropdownMenuItem
            onClick={() => {
              if (onArchive) {
                onArchive(sprint);
              } else {
                void archive.mutateAsync(sprint.id);
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

export interface SprintQuickActionsBarProps {
  sprint?: Sprint | null;
  onCreateClick?: () => void;
  onComplete?: (sprint: Sprint) => void;
}

function SprintQuickActionsBar({ sprint, onComplete }: SprintQuickActionsBarProps) {
  const start = useStartSprint();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ExportButton
        onExport={async () => {
          toast.success("Sprint export started");
        }}
      />
      {sprint?.status === "planning" ? (
        <PermissionGuard permission="sprint.update">
          <Button type="button" size="sm" onClick={() => void start.mutateAsync(sprint.id)}>
            <Play className="size-4" />
            Start sprint
          </Button>
        </PermissionGuard>
      ) : null}
      {sprint?.status === "active" && onComplete ? (
        <PermissionGuard permission="sprint.update">
          <Button type="button" size="sm" variant="outline" onClick={() => onComplete(sprint)}>
            <CheckCircle2 className="size-4" />
            Complete
          </Button>
        </PermissionGuard>
      ) : null}
    </div>
  );
}

export { SprintQuickActions, SprintQuickActionsBar };
