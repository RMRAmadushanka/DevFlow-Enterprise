"use client";

import * as React from "react";
import Link from "next/link";
import {
  FolderPlus,
  SquareCheck,
  UserPlus,
  FileText,
  Rocket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { WidgetCard } from "@/components/dashboard";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

const QuickActions = React.memo(function QuickActions() {
  return (
    <div data-slot="quick-actions">
    <WidgetCard title="Quick actions" label="Quick actions">
      <div className="flex flex-wrap gap-2">
        <PermissionGuard permission="project.create">
          <Button render={<Link href={routes.app.projects} />} size="sm" variant="outline">
            <FolderPlus className="size-4" />
            Create Project
          </Button>
        </PermissionGuard>
        <PermissionGuard permission="task.create">
          <Button render={<Link href={routes.app.tasks} />} size="sm" variant="outline">
            <SquareCheck className="size-4" />
            Create Task
          </Button>
        </PermissionGuard>
        <PermissionGuard permission="member.invite">
          <Button
            render={<Link href={routes.app.settings.members} />}
            size="sm"
            variant="outline"
          >
            <UserPlus className="size-4" />
            Invite Member
          </Button>
        </PermissionGuard>
        <Button render={<Link href={routes.app.documents} />} size="sm" variant="outline">
          <FileText className="size-4" />
          Create Document
        </Button>
        <Button render={<Link href={routes.app.deployments} />} size="sm" variant="outline">
          <Rocket className="size-4" />
          Deploy Application
        </Button>
      </div>
    </WidgetCard>
    </div>
  );
});

export { QuickActions };
