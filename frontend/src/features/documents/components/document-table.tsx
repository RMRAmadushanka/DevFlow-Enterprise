"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/data-display/badges";
import { UserAvatar } from "@/components/data-display/avatars";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { DataTable } from "@/components/data-display/table";
import { routes } from "@/config/routes";

import { VISIBILITY_LABELS } from "../constants/document.constants";
import type { Document as DocumentEntity } from "../types/document.types";
import { DocumentEmptyState, type DocumentEmptyVariant } from "./document-empty-state";
import { DocumentQuickActions } from "./document-quick-actions";
import { DocumentTableSkeleton } from "./document-skeleton";
import { FavoriteButton } from "./favorite-button";

export interface DocumentTableProps {
  documents: DocumentEntity[];
  loading?: boolean;
  emptyVariant?: DocumentEmptyVariant;
  onMove?: (document: DocumentEntity) => void;
  onShare?: (document: DocumentEntity) => void;
  onDelete?: (document: DocumentEntity) => void;
}

function DocumentTable({
  documents,
  loading,
  emptyVariant = "no-documents",
  onMove,
  onShare,
  onDelete,
}: DocumentTableProps) {
  const columns = React.useMemo<ColumnDef<DocumentEntity>[]>(
    () => [
      {
        id: "favorite",
        header: "",
        cell: ({ row }) => (
          <FavoriteButton
            documentId={row.original.id}
            favorited={row.original.favorited}
          />
        ),
        size: 40,
      },
      {
        accessorKey: "title",
        header: "Document",
        cell: ({ row }) => (
          <Link
            href={routes.app.document(row.original.id)}
            className="inline-flex max-w-xs items-center gap-2 truncate font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span aria-hidden>{row.original.icon || "📄"}</span>
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "folderName",
        header: "Folder",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {String(getValue() ?? "—")}
          </span>
        ),
      },
      {
        accessorKey: "visibility",
        header: "Visibility",
        cell: ({ row }) => (
          <StatusBadge tone="neutral" size="sm" dot>
            {VISIBILITY_LABELS[row.original.visibility]}
          </StatusBadge>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2 text-sm">
            <UserAvatar
              user={{
                id: row.original.owner.id,
                name: row.original.owner.name,
                imageUrl: row.original.owner.avatarUrl,
              }}
              size="sm"
            />
            {row.original.owner.name}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <time className="text-sm text-muted-foreground" dateTime={row.original.updatedAt}>
            {formatRelativeTime(row.original.updatedAt)}
          </time>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DocumentQuickActions
            document={row.original}
            onMove={onMove}
            onShare={onShare}
            onDelete={onDelete}
            compact
          />
        ),
      },
    ],
    [onDelete, onMove, onShare]
  );

  if (loading) return <DocumentTableSkeleton />;
  if (documents.length === 0) return <DocumentEmptyState variant={emptyVariant} />;

  return (
    <DataTable
      columns={columns}
      data={documents}
      getRowId={(row) => row.id}
      enablePagination={documents.length > 10}
    />
  );
}

export { DocumentTable };
