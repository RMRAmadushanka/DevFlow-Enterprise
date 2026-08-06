"use client";

import * as React from "react";
import Link from "next/link";
import { FolderPlus, UserPlus, SquareCheck, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/dashboard";
import { routes } from "@/config/routes";
import { PermissionGuard } from "@/lib/permissions";

import { useExportDashboardReport } from "../hooks/use-dashboard-preferences";
import { getTimeOfDayGreeting } from "../utils/greeting";

export interface DashboardHeaderProps {
  userName: string;
}

function DashboardHeader({ userName }: DashboardHeaderProps) {
  const greeting = getTimeOfDayGreeting();
  const exportReport = useExportDashboardReport();
  const firstName = userName.split(" ")[0] || userName;

  return (
    <div
      className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      data-slot="dashboard-header"
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is your engineering overview
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2" aria-label="Dashboard actions">
        <PermissionGuard permission="project.create">
          <Button render={<Link href={routes.app.projects} />} size="sm">
            <FolderPlus className="size-4" />
            Create Project
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
        <PermissionGuard permission="task.create">
          <Button render={<Link href={routes.app.tasks} />} size="sm" variant="outline">
            <SquareCheck className="size-4" />
            Create Task
          </Button>
        </PermissionGuard>
        <ExportButton
          label="Export Report"
          status={
            exportReport.isPending
              ? "loading"
              : exportReport.isSuccess
                ? "success"
                : exportReport.isError
                  ? "error"
                  : "idle"
          }
          onExport={(format) => {
            void exportReport.mutateAsync(format);
          }}
        />
        <span className="sr-only">
          <Download aria-hidden />
        </span>
      </div>
    </div>
  );
}

export { DashboardHeader };
