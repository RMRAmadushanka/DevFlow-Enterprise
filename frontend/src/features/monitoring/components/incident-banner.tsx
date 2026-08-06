"use client";

import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

import { SEVERITY_LABELS } from "../constants/monitoring.constants";
import type { Incident } from "../types/monitoring.types";
import { SEVERITY_TONE } from "./shared";

export interface IncidentBannerProps {
  incidents: Incident[];
  onDismiss?: () => void;
  onSelect?: (incident: Incident) => void;
  className?: string;
}

function IncidentBanner({
  incidents,
  onDismiss,
  onSelect,
  className,
}: IncidentBannerProps) {
  const open = incidents.filter((i) => i.status !== "resolved" && i.status !== "postmortem");
  if (open.length === 0) return null;

  const primary = open[0]!;

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      data-slot="incident-banner"
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {open.length} active incident{open.length === 1 ? "" : "s"}
            </p>
            <StatusBadge tone={SEVERITY_TONE[primary.severity]} size="sm" dot>
              {SEVERITY_LABELS[primary.severity]}
            </StatusBadge>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {primary.number}: {primary.title}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onSelect?.(primary)}
        >
          View details
        </Button>
        <Button
          render={<Link href={routes.app.monitoringIncidents} />}
          size="sm"
          variant="ghost"
        >
          All incidents
        </Button>
        {onDismiss ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Dismiss banner"
            onClick={onDismiss}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { IncidentBanner };
