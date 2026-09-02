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
import { downloadCsv, toCsv, type CsvColumn } from "@/lib/utils/csv";

import {
  useArchiveSprint,
  useCompleteSprint,
  useDuplicateSprint,
  useStartSprint,
} from "../hooks/use-sprints";
import type { Sprint } from "../types/sprint.types";

interface SprintCsvRow {
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  committedPoints: number;
  completedPoints: number;
  velocity: number;
}

const SPRINT_CSV_COLUMNS: CsvColumn<SprintCsvRow>[] = [
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
  { key: "startDate", label: "Start date" },
  { key: "endDate", label: "End date" },
  { key: "committedPoints", label: "Committed points" },
  { key: "completedPoints", label: "Completed points" },
  { key: "velocity", label: "Velocity" },
];

function toSprintCsvRow(sprint: Sprint): SprintCsvRow {
  return {
    name: sprint.name,
    status: sprint.status,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    committedPoints: sprint.committedPoints,
    completedPoints: sprint.completedPoints,
    velocity: sprint.velocity,
  };
}

function sprintFileName(name: string): string {
  return `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "sprint"}.csv`;
}

function exportSprints(sprints: Sprint[], filename: string) {
  const csv = toCsv(sprints.map(toSprintCsvRow), SPRINT_CSV_COLUMNS);
  downloadCsv(filename, csv);
}

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
                  void complete.mutateAsync({ id: sprint.id });
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
          onClick={() => {
            exportSprints([sprint], sprintFileName(sprint.name));
            toast.success("Sprint exported");
          }}
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
  /** Full currently-loaded sprint list, exported in bulk when provided. */
  sprints?: Sprint[];
  onCreateClick?: () => void;
  onComplete?: (sprint: Sprint) => void;
}

function SprintQuickActionsBar({ sprint, sprints, onComplete }: SprintQuickActionsBarProps) {
  const start = useStartSprint();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ExportButton
        formats={["csv"]}
        onExport={async () => {
          const rows = sprints && sprints.length > 0 ? sprints : sprint ? [sprint] : [];
          if (rows.length === 0) {
            toast.error("No sprints to export");
            return;
          }
          exportSprints(rows, "sprints.csv");
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
