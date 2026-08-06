"use client";

import * as React from "react";

import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import { useDocumentHistory } from "../hooks/use-documents";
import type { DocumentVersion } from "../types/document.types";
import { HistorySkeleton } from "./document-skeleton";
import { RestoreVersionModal } from "./restore-version-modal";

export interface DocumentHistoryProps {
  documentId: string;
}

export interface VersionHistoryProps {
  documentId: string;
  versions?: DocumentVersion[];
  loading?: boolean;
  onRestore?: (version: DocumentVersion) => void;
}

function VersionHistory({
  documentId,
  versions: versionsProp,
  loading,
  onRestore,
}: VersionHistoryProps) {
  const query = useDocumentHistory(documentId);
  const versions = versionsProp ?? query.data ?? [];
  const isLoading = loading ?? query.isLoading;
  const [restoreTarget, setRestoreTarget] = React.useState<DocumentVersion | null>(null);

  if (isLoading) return <HistorySkeleton />;
  if (versions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">No version history yet.</p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border" aria-label="Version history" data-slot="version-history">
        {versions.map((version) => (
          <li
            key={version.id}
            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Version {version.version}
                <span className="ml-2 font-normal text-muted-foreground">
                  by {version.authorName}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{version.summary}</p>
              <time className="text-xs text-muted-foreground" dateTime={version.createdAt}>
                {formatRelativeTime(version.createdAt)}
              </time>
            </div>
            <PermissionGuard permission="document.update">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (onRestore) onRestore(version);
                  else setRestoreTarget(version);
                }}
              >
                Restore
              </Button>
            </PermissionGuard>
          </li>
        ))}
      </ul>
      <RestoreVersionModal
        documentId={documentId}
        version={restoreTarget}
        open={Boolean(restoreTarget)}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
      />
    </>
  );
}

function DocumentHistory({ documentId }: DocumentHistoryProps) {
  return <VersionHistory documentId={documentId} />;
}

export { DocumentHistory, VersionHistory };
