"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { ConfirmModal } from "@/components/feedback/modal";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import {
  useDeleteWebhook,
  useRepositoryWebhooks,
} from "../hooks/use-repositories";
import type { RepositoryWebhook } from "../types/repository.types";
import { RepositoryEmptyState } from "./repository-empty-state";
import { BranchSkeleton } from "./repository-skeleton";
import { WebhookCard } from "./webhook-card";
import { CreateWebhookModal, EditWebhookModal } from "./webhook-modals";

export interface WebhookListProps {
  repositoryId: string;
}

function WebhookList({ repositoryId }: WebhookListProps) {
  const { data: webhooks = [], isLoading, isError } = useRepositoryWebhooks(repositoryId);
  const remove = useDeleteWebhook(repositoryId);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<RepositoryWebhook | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<RepositoryWebhook | null>(null);

  return (
    <div className="flex flex-col gap-4" data-slot="webhook-list">
      <div className="flex justify-end">
        <PermissionGuard permission="repository.update">
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add webhook
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <BranchSkeleton />
          <BranchSkeleton />
        </div>
      ) : null}

      {!isLoading && (isError || webhooks.length === 0) ? (
        <RepositoryEmptyState
          variant="no-webhooks"
          action={
            <PermissionGuard permission="repository.update">
              <Button type="button" onClick={() => setCreateOpen(true)}>
                Add webhook
              </Button>
            </PermissionGuard>
          }
        />
      ) : null}

      {!isLoading && webhooks.length > 0 ? (
        <div className="flex flex-col gap-3">
          {webhooks.map((webhook) => (
            <WebhookCard
              key={webhook.id}
              webhook={webhook}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : null}

      <CreateWebhookModal
        repositoryId={repositoryId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <EditWebhookModal
        repositoryId={repositoryId}
        webhook={editTarget}
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete webhook?"
        description={
          deleteTarget
            ? `Remove webhook delivery to ${deleteTarget.url}? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        variant="danger"
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          void remove.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null));
        }}
      />
    </div>
  );
}

export { WebhookList };
