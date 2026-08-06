"use client";

import Link from "next/link";
import {
  Archive,
  Copy,
  ExternalLink,
  GitBranch,
  GitPullRequest,
  Link2,
  MoreHorizontal,
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
  useDuplicateRepository,
  useToggleRepositoryFavorite,
} from "../hooks/use-repositories";
import type { Repository as RepositoryEntity } from "../types/repository.types";

export interface RepositoryQuickActionsProps {
  repository: RepositoryEntity;
  onArchive?: (repository: RepositoryEntity) => void;
  onTransfer?: (repository: RepositoryEntity) => void;
  onDelete?: (repository: RepositoryEntity) => void;
  compact?: boolean;
}

function RepositoryQuickActions({
  repository,
  onArchive,
  onTransfer,
  onDelete,
  compact,
}: RepositoryQuickActionsProps) {
  const favorite = useToggleRepositoryFavorite();
  const duplicate = useDuplicateRepository();

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(repository.cloneUrl || repository.remoteUrl);
      toast.success("Clone URL copied");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={`Actions for ${repository.name}`}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <PermissionGuard permission="repository.update">
          <DropdownMenuItem
            onClick={() => void favorite.mutateAsync(repository.id)}
          >
            <Star className="size-4" />
            {repository.favorited ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard permission="repository.create">
          <DropdownMenuItem onClick={() => void duplicate.mutateAsync(repository.id)}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
        </PermissionGuard>
        <DropdownMenuItem onClick={() => void copyUrl()}>
          <Link2 className="size-4" />
          Copy URL
        </DropdownMenuItem>
        {repository.remoteUrl ? (
          <DropdownMenuItem
            render={
              <a href={repository.remoteUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            <ExternalLink className="size-4" />
            Open remote
          </DropdownMenuItem>
        ) : null}
        {!compact ? (
          <DropdownMenuItem render={<Link href={routes.app.repository(repository.id)} />}>
            <GitBranch className="size-4" />
            View repository
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <PermissionGuard permission="repository.update">
          <DropdownMenuItem
            onClick={() => {
              if (onArchive) onArchive(repository);
            }}
          >
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (onTransfer) onTransfer(repository);
            }}
          >
            <GitPullRequest className="size-4" />
            Transfer
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard permission="repository.delete">
          <DropdownMenuItem
            onClick={() => {
              if (onDelete) onDelete(repository);
            }}
            className="text-destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface RepositoryQuickActionsBarProps {
  repository?: RepositoryEntity | null;
  onConnectClick?: () => void;
  onCreateClick?: () => void;
}

function RepositoryQuickActionsBar({
  onConnectClick,
  onCreateClick,
}: RepositoryQuickActionsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGuard permission="repository.create">
        {onConnectClick ? (
          <Button type="button" size="sm" variant="outline" onClick={onConnectClick}>
            Connect
          </Button>
        ) : null}
        {onCreateClick ? (
          <Button type="button" size="sm" onClick={onCreateClick}>
            Create
          </Button>
        ) : (
          <Button render={<Link href={routes.app.repositoryNew} />} size="sm">
            Create
          </Button>
        )}
      </PermissionGuard>
    </div>
  );
}

export { RepositoryQuickActions, RepositoryQuickActionsBar };
