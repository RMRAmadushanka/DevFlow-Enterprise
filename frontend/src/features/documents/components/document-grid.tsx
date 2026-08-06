"use client";

import { cn } from "@/lib/utils";

import type { Document as DocumentEntity } from "../types/document.types";
import { DocumentCard } from "./document-card";
import { DocumentEmptyState, type DocumentEmptyVariant } from "./document-empty-state";
import { DocumentGridSkeleton } from "./document-skeleton";

export interface DocumentGridProps {
  documents: DocumentEntity[];
  loading?: boolean;
  emptyVariant?: DocumentEmptyVariant;
  onMove?: (document: DocumentEntity) => void;
  onShare?: (document: DocumentEntity) => void;
  onDelete?: (document: DocumentEntity) => void;
  className?: string;
}

function DocumentGrid({
  documents,
  loading,
  emptyVariant = "no-documents",
  onMove,
  onShare,
  onDelete,
  className,
}: DocumentGridProps) {
  if (loading) return <DocumentGridSkeleton />;
  if (documents.length === 0) return <DocumentEmptyState variant={emptyVariant} />;

  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}
      data-slot="document-grid"
    >
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onMove={onMove}
          onShare={onShare}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export { DocumentGrid };
