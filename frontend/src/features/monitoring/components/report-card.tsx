"use client";

import { Download, FileText } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { cn } from "@/lib/utils";

import type { ReportDefinition } from "../types/monitoring.types";
import { formatTimestamp } from "../utils/format";

export interface ReportCardProps {
  report: ReportDefinition;
  onExport?: (report: ReportDefinition) => void;
  className?: string;
}

function ReportCard({ report, onExport, className }: ReportCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
        className
      )}
      data-slot="report-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{report.name}</h3>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {report.description || "No description"}
            </p>
          </div>
        </div>
        <StatusBadge tone="neutral" size="sm">
          {report.category}
        </StatusBadge>
      </div>

      <div className="flex flex-wrap gap-1">
        {report.metrics.slice(0, 4).map((metric) => (
          <StatusBadge key={metric} tone="info" size="sm">
            {metric}
          </StatusBadge>
        ))}
        {report.metrics.length > 4 ? (
          <StatusBadge tone="neutral" size="sm">
            +{report.metrics.length - 4}
          </StatusBadge>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          {report.lastExportedAt
            ? `Last export ${formatTimestamp(report.lastExportedAt)}`
            : `Created ${formatTimestamp(report.createdAt)}`}
          {report.schedule ? ` · ${report.schedule}` : ""}
        </p>
        <PermissionGuard permission="analytics.export">
          {onExport ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onExport(report)}
            >
              <Download className="size-4" />
              Export
            </Button>
          ) : null}
        </PermissionGuard>
      </div>
    </article>
  );
}

export { ReportCard };
