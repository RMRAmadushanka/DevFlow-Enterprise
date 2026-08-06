"use client";

import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import { UserAvatar } from "@/components/data-display/avatars";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { VISIBILITY_LABELS } from "../constants/document.constants";
import type { Document as DocumentEntity, DocumentDetail } from "../types/document.types";
import { DocumentBreadcrumb } from "./document-breadcrumb";
import { DocumentQuickActions } from "./document-quick-actions";
import { FavoriteButton } from "./favorite-button";

export interface DocumentHeaderProps {
  document?: DocumentEntity | DocumentDetail | null;
  mode?: "list" | "detail";
  onCreateClick?: () => void;
  onShare?: (document: DocumentEntity) => void;
  onMove?: (document: DocumentEntity) => void;
  onDelete?: (document: DocumentEntity) => void;
}

function DocumentHeader({
  document: doc,
  mode = "list",
  onCreateClick,
  onShare,
  onMove,
  onDelete,
}: DocumentHeaderProps) {
  if (mode === "list") {
    return (
      <PermissionGuard permission="document.create">
        {onCreateClick ? (
          <Button type="button" size="sm" onClick={onCreateClick}>
            <Plus className="size-4" />
            New document
          </Button>
        ) : (
          <Button render={<Link href={routes.app.documentNew} />} size="sm">
            <Plus className="size-4" />
            New document
          </Button>
        )}
      </PermissionGuard>
    );
  }

  if (!doc) return null;

  const breadcrumb =
    "breadcrumb" in doc && Array.isArray(doc.breadcrumb) ? doc.breadcrumb : undefined;

  return (
    <div className="flex flex-col gap-3" data-slot="document-header">
      {breadcrumb ? <DocumentBreadcrumb items={breadcrumb} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              {doc.icon || "📄"}
            </span>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {doc.title}
            </h1>
          </div>
          {doc.description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{doc.description}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <UserAvatar
                user={{
                  id: doc.owner.id,
                  name: doc.owner.name,
                  imageUrl: doc.owner.avatarUrl,
                }}
                size="sm"
              />
              {doc.owner.name}
            </span>
            <StatusBadge tone="neutral" size="sm" dot>
              {VISIBILITY_LABELS[doc.visibility]}
            </StatusBadge>
            <time dateTime={doc.updatedAt}>Updated {formatRelativeTime(doc.updatedAt)}</time>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FavoriteButton documentId={doc.id} favorited={doc.favorited} />
          <PermissionGuard permission="document.update">
            <Button render={<Link href={routes.app.documentEdit(doc.id)} />} variant="outline" size="sm">
              <Pencil className="size-4" />
              Edit
            </Button>
          </PermissionGuard>
          <DocumentQuickActions
            document={doc}
            onShare={onShare}
            onMove={onMove}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}

export { DocumentHeader };
