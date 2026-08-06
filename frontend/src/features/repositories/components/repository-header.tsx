"use client";

import Link from "next/link";
import { GitBranch, Plus, Settings } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import {
  HEALTH_LABELS,
  PROVIDER_LABELS,
  VISIBILITY_LABELS,
} from "../constants/repository.constants";
import type {
  Repository as RepositoryEntity,
  RepositoryHealth,
} from "../types/repository.types";
import { RepositoryBreadcrumb } from "./repository-breadcrumb";
import { RepositoryQuickActions } from "./repository-quick-actions";

const HEALTH_TONE: Record<RepositoryHealth, Tone> = {
  healthy: "success",
  at_risk: "warning",
  critical: "danger",
  unknown: "neutral",
};

export interface RepositoryHeaderProps {
  repository?: RepositoryEntity | null;
  mode?: "list" | "detail";
  onCreateClick?: () => void;
  onConnectClick?: () => void;
  onArchive?: (repository: RepositoryEntity) => void;
  onTransfer?: (repository: RepositoryEntity) => void;
  onDelete?: (repository: RepositoryEntity) => void;
}

function RepositoryHeader({
  repository,
  mode = "list",
  onCreateClick,
  onConnectClick,
  onArchive,
  onTransfer,
  onDelete,
}: RepositoryHeaderProps) {
  if (mode === "list") {
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
              <Plus className="size-4" />
              Create repository
            </Button>
          ) : (
            <Button render={<Link href={routes.app.repositoryNew} />} size="sm">
              <Plus className="size-4" />
              Create repository
            </Button>
          )}
        </PermissionGuard>
      </div>
    );
  }

  if (!repository) return null;

  return (
    <div className="flex flex-col gap-3" data-slot="repository-header">
      <RepositoryBreadcrumb
        repositoryId={repository.id}
        repositoryName={repository.name}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {repository.fullName || repository.name}
          </h1>
          {repository.description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {repository.description}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="neutral" size="sm" dot>
              {VISIBILITY_LABELS[repository.visibility]}
            </StatusBadge>
            <StatusBadge tone={HEALTH_TONE[repository.health]} size="sm" dot>
              {HEALTH_LABELS[repository.health]}
            </StatusBadge>
            <StatusBadge tone="info" size="sm">
              {PROVIDER_LABELS[repository.provider]}
            </StatusBadge>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <GitBranch className="size-3.5" aria-hidden />
              {repository.defaultBranch}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PermissionGuard permission="repository.update">
            <Button
              render={<Link href={routes.app.repositorySettings(repository.id)} />}
              variant="outline"
              size="sm"
            >
              <Settings className="size-4" />
              Settings
            </Button>
          </PermissionGuard>
          <RepositoryQuickActions
            repository={repository}
            onArchive={onArchive}
            onTransfer={onTransfer}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}

export { RepositoryHeader };
