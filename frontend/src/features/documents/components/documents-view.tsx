"use client";

import * as React from "react";
import Link from "next/link";
import { Download, LayoutGrid, List, Plus, Table2, Upload } from "lucide-react";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { toast } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useDocuments } from "../hooks/use-documents";
import { useDocumentStore } from "../store/document.store";
import type { Document as DocumentEntity, DocumentViewMode } from "../types/document.types";
import { CreateDocumentModal } from "./create-document-modal";
import { DeleteDocumentModal } from "./delete-document-modal";
import { DocumentCard } from "./document-card";
import { DocumentEmptyState } from "./document-empty-state";
import { DocumentFilters } from "./document-filters";
import { DocumentGrid } from "./document-grid";
import { DocumentLayout } from "./document-layout";
import { DocumentSearch } from "./document-search";
import { DocumentSkeleton } from "./document-skeleton";
import { DocumentTable } from "./document-table";
import { MoveDocumentModal } from "./move-document-modal";
import { PinnedDocuments } from "./pinned-documents";
import { ShareDocumentModal } from "./share-document-modal";

export interface DocumentsViewProps {
  title?: string;
  description?: string;
  hideSidebar?: boolean;
  favoritesOnly?: boolean;
  sharedOnly?: boolean;
  trashOnly?: boolean;
  /** Reserved for project-scoped document lists. */
  projectId?: string | null;
}

function ViewModeToggle() {
  const viewMode = useDocumentStore((s) => s.viewMode);
  const setViewMode = useDocumentStore((s) => s.setViewMode);

  const modes: Array<{ value: DocumentViewMode; label: string; icon: React.ReactNode }> = [
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

function DocumentsView({
  title = "Documents",
  description = "Capture and share knowledge across your workspace.",
  hideSidebar,
  favoritesOnly,
  sharedOnly,
  trashOnly,
}: DocumentsViewProps) {
  const { data, isLoading, isError } = useDocuments({
    favoritesOnly,
    sharedOnly,
    trashOnly,
  });
  const filters = useDocumentStore((s) => s.filters);
  const viewMode = useDocumentStore((s) => s.viewMode);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [shareTarget, setShareTarget] = React.useState<DocumentEntity | null>(null);
  const [moveTarget, setMoveTarget] = React.useState<DocumentEntity | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DocumentEntity | null>(null);

  const items = data?.items ?? [];
  const hasQuery =
    Boolean(filters.q.trim()) ||
    filters.visibility !== "all" ||
    Boolean(filters.folderId) ||
    Boolean(filters.authorId);
  const emptyVariant = hasQuery ? "no-results" : "no-documents";

  return (
    <>
      <ListPageTemplate
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Workspace", href: routes.app.home },
          { label: "Documents", href: routes.app.documents },
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toast.success("Export started")}
            >
              <Download className="size-4" />
              Export
            </Button>
            <PermissionGuard permission="document.create">
              <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                New document
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="document.create">
              <Button render={<Link href={routes.app.documentNew} />} variant="outline" size="sm">
                Full editor
              </Button>
            </PermissionGuard>
          </div>
        }
        filters={
          <div className="flex w-full flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <DocumentSearch className="max-w-md flex-1" />
              <ViewModeToggle />
            </div>
            <DocumentFilters />
          </div>
        }
      >
        <DocumentLayout hideSidebar={hideSidebar}>
          {isError ? (
            <FeatureEmptyState
              variant="no-results"
              title="Could not load documents"
              description="Something went wrong while loading your documents. Try again."
            />
          ) : (
            <div className="flex flex-col gap-6">
              {!favoritesOnly && !sharedOnly && !trashOnly ? (
                <PinnedDocuments />
              ) : null}

              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                </div>
              ) : viewMode === "table" ? (
                <DocumentTable
                  documents={items}
                  emptyVariant={emptyVariant}
                  onShare={setShareTarget}
                  onMove={setMoveTarget}
                  onDelete={setDeleteTarget}
                />
              ) : viewMode === "list" ? (
                <div className="flex flex-col gap-2" data-slot="document-list">
                  {items.length === 0 ? (
                    <DocumentEmptyState variant={emptyVariant} />
                  ) : (
                    items.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onShare={setShareTarget}
                        onMove={setMoveTarget}
                        onDelete={setDeleteTarget}
                        className="shadow-none"
                      />
                    ))
                  )}
                </div>
              ) : (
                <DocumentGrid
                  documents={items}
                  emptyVariant={emptyVariant}
                  onShare={setShareTarget}
                  onMove={setMoveTarget}
                  onDelete={setDeleteTarget}
                />
              )}
            </div>
          )}
        </DocumentLayout>
      </ListPageTemplate>

      <CreateDocumentModal open={createOpen} onOpenChange={setCreateOpen} />
      <ShareDocumentModal
        document={shareTarget}
        open={Boolean(shareTarget)}
        onOpenChange={(open) => {
          if (!open) setShareTarget(null);
        }}
      />
      <MoveDocumentModal
        document={moveTarget}
        open={Boolean(moveTarget)}
        onOpenChange={(open) => {
          if (!open) setMoveTarget(null);
        }}
      />
      <DeleteDocumentModal
        document={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </>
  );
}

export { DocumentsView };
