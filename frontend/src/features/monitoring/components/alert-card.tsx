"use client";

import { Bell, Pencil, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { cn } from "@/lib/utils";

import {
  METRIC_LABELS,
  SERVICE_LABELS,
  SEVERITY_LABELS,
} from "../constants/monitoring.constants";
import type { Alert } from "../types/monitoring.types";
import { formatTimestamp } from "../utils/format";
import { ALERT_STATUS_TONE, SEVERITY_TONE } from "./shared";

export interface AlertCardProps {
  alert: Alert;
  onEdit?: (alert: Alert) => void;
  onDelete?: (alert: Alert) => void;
  onSelect?: (alert: Alert) => void;
  className?: string;
}

function AlertCard({ alert, onEdit, onDelete, onSelect, className }: AlertCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
        onSelect && "cursor-pointer hover:border-primary/40",
        className
      )}
      data-slot="alert-card"
      onClick={() => onSelect?.(alert)}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(alert);
        }
      }}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
            <Bell className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{alert.name}</h3>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {alert.description || "No description"}
            </p>
          </div>
        </div>
        <StatusBadge tone={SEVERITY_TONE[alert.severity]} size="sm" dot>
          {SEVERITY_LABELS[alert.severity]}
        </StatusBadge>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge tone={ALERT_STATUS_TONE[alert.status]} size="sm">
          {alert.status}
        </StatusBadge>
        <StatusBadge tone="neutral" size="sm">
          {SERVICE_LABELS[alert.service]}
        </StatusBadge>
        <StatusBadge tone="info" size="sm">
          {METRIC_LABELS[alert.metric]} {alert.condition} {alert.threshold}
        </StatusBadge>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          {alert.lastTriggeredAt
            ? `Last triggered ${formatTimestamp(alert.lastTriggeredAt)} · ${alert.triggeredCount}×`
            : `Created ${formatTimestamp(alert.createdAt)}`}
        </p>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <PermissionGuard permission="monitoring.update">
            {onEdit ? (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Edit alert"
                onClick={() => onEdit(alert)}
              >
                <Pencil className="size-4" />
              </Button>
            ) : null}
          </PermissionGuard>
          <PermissionGuard permission="monitoring.manage">
            {onDelete ? (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Delete alert"
                onClick={() => onDelete(alert)}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </PermissionGuard>
        </div>
      </div>
    </article>
  );
}

export { AlertCard };
