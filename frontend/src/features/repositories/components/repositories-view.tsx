"use client";

import * as React from "react";
import { LayoutGrid, List, Plus, Table2, Upload } from "lucide-react";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { toast } from "@/components/feedback/toast";
import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { SORT_OPTIONS } from "../constants/repository.constants";
import { useRepositories } from "../hooks/use-repositories";
import { useRepositoryStore } from "../store/repository.store";
import type {
  Repository as RepositoryEntity,
  RepositorySortField,
  RepositoryViewMode,
} from "../types/repository.types";
import { ArchiveRepositoryModal } from "./archive-repository-modal";
import { ConnectRepositoryModal } from "./connect-repository-modal";
import { CreateRepositoryModal } from "./create-repository-modal";
import { DeleteRepositoryModal } from "./delete-repository-modal";
import { RepositoryEmptyState } from "./repository-empty-state";
import { RepositoryFilters } from "./repository-filters";
import { RepositoryGrid } from "./repository-grid";
import { RepositoryHeader } from "./repository-header";
import { RepositorySearch } from "./repository-search";
import { RepositorySkeleton } from "./repository-skeleton";
import { RepositoryTable } from "./repository-table";
import { TransferRepositoryModal } from "./transfer-repository-modal";

export interface RepositoriesViewProps {
  projectId?: string | null;
  title?: string;
  description?: string;
}

function RepositorySort() {
  const sort = useRepositoryStore((s) => s.sort);
  const setSort = useRepositoryStore((s) => s.setSort);

  return (
    <SelectField
      label="Sort"
      value={sort}
      onValueChange={(value) => {
        if (value) setSort(value as RepositorySortField);
      }}
      options={SORT_OPTIONS}
      className="w-[180px]"
      size="sm"
    />
  );
}

function ViewModeToggle() {
  const viewMode = useRepositoryStore((s) => s.viewMode);
  const setViewMode = useRepositoryStore((s) => s.setViewMode);

  const modes: Array<{ value: RepositoryViewMode; label: string; icon: React.ReactNode }> = [
    { value: "grid", label: "Grid view", icon: <LayoutGrid className="size-4" /> },
    { value: "table", label: "Table view", icon: <Table2 className="size-4" /> },
    { value: "list", label: "List view", icon: <List className="size-4" /> },
  ];

  return (
    <div role="group" aria-label="View mode" className="flex shrink-0 items-center gap-1">
      {modes.map((mode) => (
        <Button
          key={mode.value}
          type="button"
          size="icon-sm"
          variant={viewMode === mode.value ? "secondary" : "ghost"}
          aria-pressed={viewMode === mode.value}
          aria-label={mode.label}
          onClick={() => setViewMode(mode.value)}
        >
          {mode.icon}
        </Button>
      ))}
    </div>
  );
}

function RepositoriesView({
  projectId,
  title = "Repositories",
  description = "Manage source control across your workspace.",
}: RepositoriesViewProps) {
  const { data, isLoading, isError } = useRepositories(projectId);
  const filters = useRepositoryStore((s) => s.filters);
  const viewMode = useRepositoryStore((s) => s.viewMode);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [connectOpen, setConnectOpen] = React.useState(false);
  const [archiveTarget, setArchiveTarget] = React.useState<RepositoryEntity | null>(null);
  const [transferTarget, setTransferTarget] = React.useState<RepositoryEntity | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<RepositoryEntity | null>(null);

  const items = data?.items ?? [];
  const hasQuery =
    Boolean(filters.q.trim()) ||
    filters.visibility !== "all" ||
    filters.provider !== "all" ||
    filters.status !== "all" ||
    Boolean(filters.language) ||
    Boolean(filters.projectId) ||
    filters.favoritesOnly ||
    filters.archivedOnly;
  const emptyVariant = hasQuery ? "no-results" : "no-repositories";

  return (
    <>
      <ListPageTemplate
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Workspace", href: routes.app.home },
          { label: "Repositories", href: routes.app.repositories },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toast.success("Import started (UI only)")}
            >
              <Upload className="size-4" />
              Import
            </Button>
            <PermissionGuard permission="repository.create">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConnectOpen(true)}
              >
                Connect
              </Button>
            </PermissionGuard>
            <RepositoryHeader
              mode="list"
              onCreateClick={() => setCreateOpen(true)}
              onConnectClick={() => setConnectOpen(true)}
            />
          </div>
        }
        filters={
          <div className="flex w-full flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <RepositorySearch className="max-w-md flex-1" />
              <RepositorySort />
              <ViewModeToggle />
              <PermissionGuard permission="repository.create">
                <Button
                  type="button"
                  className="lg:hidden"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="size-4" />
                  Create
                </Button>
              </PermissionGuard>
            </div>
            <RepositoryFilters />
          </div>
        }
        loading={isLoading}
        empty={
          isError ? (
            <RepositoryEmptyState variant="no-results" />
          ) : !isLoading && items.length === 0 ? (
            <RepositoryEmptyState variant={emptyVariant} />
          ) : null
        }
      >
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <RepositorySkeleton />
            <RepositorySkeleton />
            <RepositorySkeleton />
          </div>
        ) : null}

        {!isLoading && (viewMode === "grid" || viewMode === "list") ? (
          <RepositoryGrid
            repositories={items}
            emptyVariant={emptyVariant}
            onArchive={setArchiveTarget}
            onTransfer={setTransferTarget}
            onDelete={setDeleteTarget}
          />
        ) : null}

        {!isLoading && viewMode === "table" ? (
          <RepositoryTable
            repositories={items}
            emptyVariant={emptyVariant}
            onArchive={setArchiveTarget}
            onTransfer={setTransferTarget}
            onDelete={setDeleteTarget}
          />
        ) : null}
      </ListPageTemplate>

      <CreateRepositoryModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultProjectId={projectId ?? undefined}
      />
      <ConnectRepositoryModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        defaultProjectId={projectId ?? undefined}
      />
      <ArchiveRepositoryModal
        repository={archiveTarget}
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      />
      <TransferRepositoryModal
        repository={transferTarget}
        open={Boolean(transferTarget)}
        onOpenChange={(open) => {
          if (!open) setTransferTarget(null);
        }}
      />
      <DeleteRepositoryModal
        repository={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </>
  );
}

export { RepositoriesView };
