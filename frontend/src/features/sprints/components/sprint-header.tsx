"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import type { Sprint } from "../types/sprint.types";
import { SprintQuickActionsBar } from "./sprint-quick-actions";
import { SprintStatusBadge } from "./sprint-status-badge";

export interface SprintHeaderProps {
  sprint?: Sprint | null;
  mode?: "list" | "detail";
  onCreateClick?: () => void;
  onComplete?: (sprint: Sprint) => void;
}

function SprintHeader({
  sprint,
  mode = "list",
  onCreateClick,
  onComplete,
}: SprintHeaderProps) {
  if (mode === "detail" && sprint) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SprintStatusBadge status={sprint.status} />
          <span className="text-sm text-muted-foreground">{sprint.projectName}</span>
        </div>
        <SprintQuickActionsBar sprint={sprint} onComplete={onComplete} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGuard permission="sprint.create">
        {onCreateClick ? (
          <Button type="button" onClick={onCreateClick}>
            <Plus className="size-4" />
            Create sprint
          </Button>
        ) : (
          <Button render={<Link href={routes.app.sprintNew} />}>
            <Plus className="size-4" />
            Create sprint
          </Button>
        )}
      </PermissionGuard>
    </div>
  );
}

export { SprintHeader };
