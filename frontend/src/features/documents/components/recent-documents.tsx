"use client";

import Link from "next/link";

import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { routes } from "@/config/routes";

import { useRecentDocuments } from "../hooks/use-documents";
import type { Document as DocumentEntity } from "../types/document.types";
import { DocumentEmptyState } from "./document-empty-state";
import { DocumentSkeleton } from "./document-skeleton";

export interface RecentDocumentsProps {
  documents?: DocumentEntity[];
  loading?: boolean;
  limit?: number;
  className?: string;
}

function RecentDocuments({
  documents: documentsProp,
  loading,
  limit = 8,
  className,
}: RecentDocumentsProps) {
  const query = useRecentDocuments();
  const documents = (documentsProp ?? query.data ?? []).slice(0, limit);
  const isLoading = loading ?? query.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Loading recent documents">
        <DocumentSkeleton />
        <DocumentSkeleton />
      </div>
    );
  }

  if (documents.length === 0) {
    return <DocumentEmptyState variant="no-recent" />;
  }

  return (
    <ul className={className} aria-label="Recent documents" data-slot="recent-documents">
      {documents.map((doc) => (
        <li key={doc.id} className="border-b border-border last:border-b-0">
          <Link
            href={routes.app.document(doc.id)}
            className="flex items-center gap-3 px-1 py-3 outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span className="text-lg" aria-hidden>
              {doc.icon || "📄"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {doc.title}
              </span>
              <time className="text-xs text-muted-foreground" dateTime={doc.updatedAt}>
                {formatRelativeTime(doc.lastOpenedAt ?? doc.updatedAt)}
              </time>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export { RecentDocuments };
