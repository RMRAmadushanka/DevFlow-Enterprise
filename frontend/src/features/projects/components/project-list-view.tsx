"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, List, Plus, Rows3, Upload } from "lucide-react";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { ExportButton } from "@/components/dashboard";
import { toast } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useProjects } from "../hooks/use-projects";
import { useProjectStore } from "../store/project.store";
import type { Project } from "../types/project.types";
import { DuplicateProjectModal } from "./duplicate-project-modal";
import { ProjectArchiveModal } from "./project-archive-modal";
import { ProjectEmptyState } from "./project-empty-state";
import { ProjectFilters } from "./project-filters";
import { ProjectGrid } from "./project-grid";
import { ProjectSearch } from "./project-search";
import { ProjectSort } from "./project-sort";
import { ProjectTable } from "./project-table";

function ProjectListView() {
  const { data, isLoading, isError } = useProjects();
  const viewMode = useProjectStore((s) => s.viewMode);
  const setViewMode = useProjectStore((s) => s.setViewMode);
  const filters = useProjectStore((s) => s.filters);

  const [archiveTarget, setArchiveTarget] = React.useState<Project | null>(null);
  const [duplicateTarget, setDuplicateTarget] = React.useState<Project | null>(null);

  const items = data?.items ?? [];
  const hasQuery = Boolean(filters.q.trim()) || filters.status !== "all";
  const emptyVariant = hasQuery ? "no-results" : "no-projects";

  return (
    <>
      <ListPageTemplate
        title="Projects"
        description="Manage all software projects."
        breadcrumbs={[
          { label: "Workspace", href: routes.app.home },
          { label: "Projects" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toast.info("Import will connect to your SCM providers soon.")}
            >
              <Upload className="size-4" />
              Import
            </Button>
            <ExportButton
              onExport={async () => {
                toast.success("Project export started");
              }}
            />
            <PermissionGuard permission="project.create">
              <Button render={<Link href={routes.app.projectNew} />}>
                <Plus className="size-4" />
                Create project
              </Button>
            </PermissionGuard>
          </div>
        }
        filters={
          <div className="flex w-full flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <ProjectSearch className="max-w-md flex-1" />
              <ProjectSort />
              <div
                role="group"
                aria-label="View mode"
                className="flex shrink-0 items-center gap-1"
              >
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
                <Button
                  type="button"
                  size="icon-sm"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  aria-pressed={viewMode === "grid"}
                  aria-label="Grid view"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant={viewMode === "compact" ? "secondary" : "ghost"}
                  aria-pressed={viewMode === "compact"}
                  aria-label="Compact view"
                  onClick={() => setViewMode("compact")}
                >
                  <Rows3 className="size-4" />
                </Button>
              </div>
            </div>
            <ProjectFilters />
          </div>
        }
        loading={false}
        empty={
          isError ? (
            <ProjectEmptyState variant="no-results" />
          ) : !isLoading && items.length === 0 ? (
            <ProjectEmptyState variant={emptyVariant} />
          ) : null
        }
      >
        {viewMode === "table" ? (
          <>
            <div className="hidden md:block">
              <ProjectTable
                projects={items}
                loading={isLoading}
                emptyVariant={emptyVariant}
                onArchive={setArchiveTarget}
                onDuplicate={setDuplicateTarget}
              />
            </div>
            <div className="md:hidden">
              <ProjectGrid
                projects={items}
                loading={isLoading}
                compact
                emptyVariant={emptyVariant}
                onArchive={setArchiveTarget}
                onDuplicate={setDuplicateTarget}
              />
            </div>
          </>
        ) : (
          <ProjectGrid
            projects={items}
            loading={isLoading}
            compact={viewMode === "compact"}
            emptyVariant={emptyVariant}
            onArchive={setArchiveTarget}
            onDuplicate={setDuplicateTarget}
          />
        )}
      </ListPageTemplate>

      <ProjectArchiveModal
        project={archiveTarget}
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      />

      <DuplicateProjectModal
        project={duplicateTarget}
        open={Boolean(duplicateTarget)}
        onOpenChange={(open) => {
          if (!open) setDuplicateTarget(null);
        }}
      />
    </>
  );
}

export { ProjectListView };
