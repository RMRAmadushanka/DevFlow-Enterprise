"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

export interface TaskHeaderActionsProps {
  onCreateClick?: () => void;
  extra?: React.ReactNode;
}

function TaskHeader({ onCreateClick, extra }: TaskHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" data-slot="task-header-actions">
      {extra}
      <PermissionGuard permission="task.create">
        {onCreateClick ? (
          <Button type="button" onClick={onCreateClick}>
            <Plus className="size-4" />
            Create task
          </Button>
        ) : (
          <Button render={<Link href={routes.app.taskNew} />}>
            <Plus className="size-4" />
            Create task
          </Button>
        )}
      </PermissionGuard>
    </div>
  );
}

export { TaskHeader };
