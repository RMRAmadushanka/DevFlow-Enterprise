"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, LayoutGrid, List, Plus } from "lucide-react";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { DashboardSection } from "@/components/dashboard/layout";
import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { SORT_OPTIONS } from "../constants/sprint.constants";
import { useSprints } from "../hooks/use-sprints";
import { useSprintStore } from "../store/sprint.store";
import type { Sprint, SprintSortField } from "../types/sprint.types";
import { CompleteSprintModal } from "./complete-sprint-modal";
import { CreateSprintModal } from "./create-sprint-modal";
import { DeleteSprintModal } from "./delete-sprint-modal";
import { EditSprintModal } from "./edit-sprint-modal";
import { SprintCard } from "./sprint-card";
import { SprintEmptyState } from "./sprint-empty-state";
import { SprintFilters } from "./sprint-filters";
import { SprintHeader } from "./sprint-header";
import { SprintQuickActionsBar } from "./sprint-quick-actions";
import { SprintSearch } from "./sprint-search";
import { SprintSkeleton } from "./sprint-skeleton";
import { SprintTable } from "./sprint-table";
import { SprintTimeline } from "./sprint-timeline";

export interface SprintsViewProps {
  projectId?: string | null;
  title?: string;
  description?: string;
}

function SprintSort() {
  const sort = useSprintStore((s) => s.sort);
  const setSort = useSprintStore((s) => s.setSort);

  return (
    <SelectField
      label="Sort"
      value={sort}
      onValueChange={(value) => {
        if (value) setSort(value as SprintSortField);
      }}
      options={SORT_OPTIONS}
      className="w-[180px]"
      size="sm"
    />
  );
}

function SprintSection({
  title,
  sprints,
  onComplete,
  onArchive,
}: {
  title: string;
  sprints: Sprint[];
  onComplete?: (sprint: Sprint) => void;
  onArchive?: (sprint: Sprint) => void;
}) {
  if (sprints.length === 0) return null;

  return (
    <DashboardSection title={`${title} (${sprints.length})`}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sprints.map((sprint) => (
          <SprintCard
            key={sprint.id}
            sprint={sprint}
            onComplete={onComplete}
            onArchive={onArchive}
          />
        ))}
      </div>
    </DashboardSection>
  );
}

function SprintsView({
  projectId,
  title = "Sprints",
  description = "Plan, track, and review agile iterations.",
}: SprintsViewProps) {
  const { data, isLoading, isError } = useSprints(projectId);
  const filters = useSprintStore((s) => s.filters);
  const [viewMode, setViewMode] = React.useState<"cards" | "table" | "timeline">("cards");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Sprint | null>(null);
  const [completeTarget, setCompleteTarget] = React.useState<Sprint | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Sprint | null>(null);

  const hasQuery = Boolean(filters.q.trim()) || filters.status !== "all" || Boolean(filters.projectId);
  const emptyVariant = hasQuery ? "no-results" : "no-sprint";

  const current = data?.current ?? null;
  const upcoming = data?.upcoming ?? [];
  const completed = data?.completed ?? [];
  const archived = data?.archived ?? [];
  const allItems = data?.items ?? [];

  return (
    <>
      <ListPageTemplate
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Workspace", href: routes.app.home },
          { label: "Sprints", href: routes.app.sprints },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SprintQuickActionsBar sprint={current} onComplete={setCompleteTarget} />
            <Button render={<Link href={routes.app.sprints} />} variant="outline" size="sm">
              <BarChart3 className="size-4" />
              Reports
            </Button>
            <SprintHeader onCreateClick={() => setCreateOpen(true)} />
          </div>
        }
        filters={
          <div className="flex w-full flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <SprintSearch className="max-w-md flex-1" />
              <SprintSort />
              <div
                role="group"
                aria-label="View mode"
                className="flex shrink-0 items-center gap-1"
              >
                <Button
                  type="button"
                  size="icon-sm"
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  aria-pressed={viewMode === "cards"}
                  aria-label="Card view"
                  onClick={() => setViewMode("cards")}
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  aria-pressed={viewMode === "table"}
                  aria-label="Table view"
                  onClick={() => setViewMode("table")}
                >
                  <List className="size-4" />
                </Button>
              </div>
              <PermissionGuard permission="sprint.create">
                <Button type="button" className="lg:hidden" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-4" />
                  Create
                </Button>
              </PermissionGuard>
            </div>
            <SprintFilters />
          </div>
        }
        loading={isLoading}
        empty={
          isError ? (
            <SprintEmptyState variant="no-results" />
          ) : !isLoading && allItems.length === 0 ? (
            <SprintEmptyState variant={emptyVariant} />
          ) : null
        }
      >
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SprintSkeleton />
            <SprintSkeleton />
            <SprintSkeleton />
          </div>
        ) : null}

        {!isLoading && viewMode === "table" ? (
          <SprintTable
            sprints={allItems}
            emptyVariant={emptyVariant}
            onComplete={setCompleteTarget}
          />
        ) : null}

        {!isLoading && viewMode === "timeline" ? (
          <SprintTimeline sprints={allItems} orientation="horizontal" />
        ) : null}

        {!isLoading && viewMode === "cards" ? (
          <div className="flex flex-col gap-8">
            {current ? (
              <DashboardSection title="Current sprint">
                <SprintCard sprint={current} onComplete={setCompleteTarget} />
              </DashboardSection>
            ) : null}
            <SprintSection
              title="Upcoming"
              sprints={upcoming}
              onComplete={setCompleteTarget}
            />
            <SprintSection title="Completed" sprints={completed} />
            <SprintSection title="Archived" sprints={archived} />
          </div>
        ) : null}
      </ListPageTemplate>

      <CreateSprintModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultProjectId={projectId ?? undefined}
      />
      <EditSprintModal
        sprint={editTarget}
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      />
      <CompleteSprintModal
        sprint={completeTarget}
        open={Boolean(completeTarget)}
        onOpenChange={(open) => {
          if (!open) setCompleteTarget(null);
        }}
      />
      <DeleteSprintModal
        sprint={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </>
  );
}

export { SprintsView };
