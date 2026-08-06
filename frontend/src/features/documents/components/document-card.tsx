"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import { UserAvatar } from "@/components/data-display/avatars";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

import { VISIBILITY_LABELS } from "../constants/document.constants";
import type { Document as DocumentEntity } from "../types/document.types";
import { FavoriteButton } from "./favorite-button";
import { DocumentQuickActions } from "./document-quick-actions";

export interface DocumentCardProps {
  document: DocumentEntity;
  onMove?: (document: DocumentEntity) => void;
  onShare?: (document: DocumentEntity) => void;
  onDelete?: (document: DocumentEntity) => void;
  className?: string;
}

function visibilityTone(visibility: DocumentEntity["visibility"]) {
  switch (visibility) {
    case "public":
      return "success" as const;
    case "restricted":
      return "warning" as const;
    case "private":
      return "neutral" as const;
    default:
      return "info" as const;
  }
}

function DocumentCard({
  document: doc,
  onMove,
  onShare,
  onDelete,
  className,
}: DocumentCardProps) {
  return (
    <Card
      data-slot="document-card"
      className={cn("transition-colors hover:border-ring/40", className)}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <span className="text-xl leading-none" aria-hidden>
              {doc.icon || "📄"}
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={routes.app.document(doc.id)}
                className="text-base font-semibold text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {doc.title}
              </Link>
              {doc.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {doc.description}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <FavoriteButton documentId={doc.id} favorited={doc.favorited} />
            <DocumentQuickActions
              document={doc}
              onMove={onMove}
              onShare={onShare}
              onDelete={onDelete}
              compact
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={visibilityTone(doc.visibility)} size="sm" dot>
            {VISIBILITY_LABELS[doc.visibility]}
          </StatusBadge>
          {doc.tags.slice(0, 3).map((tag) => (
            <StatusBadge key={tag} tone="neutral" size="sm">
              {tag}
            </StatusBadge>
          ))}
          {doc.tags.length > 3 ? (
            <span className="text-xs text-muted-foreground">+{doc.tags.length - 3}</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            <time dateTime={doc.updatedAt}>{formatRelativeTime(doc.updatedAt)}</time>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export { DocumentCard };
