"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

import { useDocumentFavorites } from "../hooks/use-documents";
import type { Document as DocumentEntity } from "../types/document.types";
import { DocumentEmptyState } from "./document-empty-state";
import { DocumentSkeleton } from "./document-skeleton";

export interface PinnedDocumentsProps {
  documents?: DocumentEntity[];
  loading?: boolean;
  className?: string;
}

function PinnedDocuments({ documents: documentsProp, loading, className }: PinnedDocumentsProps) {
  const query = useDocumentFavorites();
  const documents = documentsProp ?? query.data ?? [];
  const isLoading = loading ?? query.isLoading;

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto" aria-busy="true" aria-label="Loading favorites">
        <DocumentSkeleton />
      </div>
    );
  }

  if (documents.length === 0) {
    return <DocumentEmptyState variant="no-favorites" />;
  }

  return (
    <div
      className={cn("flex gap-2 overflow-x-auto pb-1", className)}
      role="list"
      aria-label="Favorite documents"
      data-slot="pinned-documents"
    >
      {documents.map((doc) => (
        <Button
          key={doc.id}
          render={<Link href={routes.app.document(doc.id)} />}
          variant="outline"
          size="sm"
          className="shrink-0"
          role="listitem"
        >
          <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
          <span aria-hidden>{doc.icon || "📄"}</span>
          <span className="max-w-[140px] truncate">{doc.title}</span>
        </Button>
      ))}
    </div>
  );
}

export { PinnedDocuments };
