"use client";

import Link from "next/link";
import {
  Archive,
  Copy,
  FolderInput,
  Link2,
  MoreHorizontal,
  Share2,
  Star,
  Trash2,
} from "lucide-react";

import { toast } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import {
  useArchiveDocument,
  useDuplicateDocument,
  useToggleFavorite,
} from "../hooks/use-documents";
import type { Document as DocumentEntity } from "../types/document.types";

export interface DocumentQuickActionsProps {
  document: DocumentEntity;
  onMove?: (document: DocumentEntity) => void;
  onShare?: (document: DocumentEntity) => void;
  onDelete?: (document: DocumentEntity) => void;
  compact?: boolean;
}

function DocumentQuickActions({
  document: doc,
  onMove,
  onShare,
  onDelete,
  compact,
}: DocumentQuickActionsProps) {
  const duplicate = useDuplicateDocument();
  const archive = useArchiveDocument();
  const toggleFavorite = useToggleFavorite();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            size={compact ? "icon-sm" : "icon-sm"}
            variant="ghost"
            aria-label={`Actions for ${doc.title}`}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <PermissionGuard permission="document.create">
          <DropdownMenuItem onClick={() => void duplicate.mutateAsync(doc.id)}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard permission="document.update">
          <DropdownMenuItem
            onClick={() => {
              if (onMove) onMove(doc);
            }}
          >
            <FolderInput className="size-4" />
            Move
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void toggleFavorite.mutateAsync(doc.id)}>
            <Star className="size-4" />
            {doc.favorited ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void archive.mutateAsync(doc.id)}>
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
        </PermissionGuard>
        <DropdownMenuSeparator />
        <PermissionGuard permission="document.update">
          <DropdownMenuItem
            onClick={() => {
              if (onShare) onShare(doc);
            }}
          >
            <Share2 className="size-4" />
            Share
          </DropdownMenuItem>
        </PermissionGuard>
        <DropdownMenuItem
          onClick={async () => {
            const url = `${window.location.origin}${routes.app.document(doc.id)}`;
            await navigator.clipboard.writeText(url);
            toast.success("Link copied");
          }}
        >
          <Link2 className="size-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <PermissionGuard permission="document.delete">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (onDelete) onDelete(doc);
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface DocumentQuickActionsBarProps {
  onCreateHref?: string;
}

function DocumentQuickActionsBar({
  onCreateHref = routes.app.documentNew,
}: DocumentQuickActionsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGuard permission="document.create">
        <Button render={<Link href={onCreateHref} />} size="sm">
          New document
        </Button>
      </PermissionGuard>
    </div>
  );
}

export { DocumentQuickActions, DocumentQuickActionsBar };
