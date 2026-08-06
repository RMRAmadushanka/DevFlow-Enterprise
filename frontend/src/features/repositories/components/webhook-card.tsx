"use client";

import { Webhook } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionGuard } from "@/lib/permissions";
import { cn } from "@/lib/utils";

import type { RepositoryWebhook, WebhookStatus } from "../types/repository.types";
import { formatRelativeCommitDate } from "../utils/format";

const WEBHOOK_TONE: Record<WebhookStatus, Tone> = {
  active: "success",
  disabled: "neutral",
  failing: "danger",
};

export interface WebhookCardProps {
  webhook: RepositoryWebhook;
  onEdit?: (webhook: RepositoryWebhook) => void;
  onDelete?: (webhook: RepositoryWebhook) => void;
  className?: string;
}

function WebhookCard({ webhook, onEdit, onDelete, className }: WebhookCardProps) {
  return (
    <Card
      data-slot="webhook-card"
      className={cn("transition-colors hover:border-ring/40", className)}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <Webhook className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{webhook.url}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {webhook.events.join(", ")}
              </p>
            </div>
          </div>
          <StatusBadge tone={WEBHOOK_TONE[webhook.status]} size="sm" dot>
            {webhook.status}
          </StatusBadge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>
            Secret {webhook.secretConfigured ? "configured" : "not set"}
          </span>
          {webhook.lastDeliveryAt ? (
            <span>
              Last delivery{" "}
              <time dateTime={webhook.lastDeliveryAt}>
                {formatRelativeCommitDate(webhook.lastDeliveryAt)}
              </time>
              {webhook.lastDeliveryStatus ? ` · ${webhook.lastDeliveryStatus}` : ""}
            </span>
          ) : (
            <span>No deliveries yet</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <PermissionGuard permission="repository.update">
            {onEdit ? (
              <Button type="button" size="sm" variant="outline" onClick={() => onEdit(webhook)}>
                Edit
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onDelete(webhook)}
              >
                Delete
              </Button>
            ) : null}
          </PermissionGuard>
        </div>
      </CardContent>
    </Card>
  );
}

export { WebhookCard };
