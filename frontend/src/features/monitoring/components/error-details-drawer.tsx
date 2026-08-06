"use client";

import { StatusBadge } from "@/components/data-display/badges";
import { DetailDrawer } from "@/components/feedback/drawer";

import { SERVICE_LABELS } from "../constants/monitoring.constants";
import { useTrackedError } from "../hooks/use-monitoring";
import { formatTimestamp } from "../utils/format";
import { ERROR_STATUS_TONE } from "./shared";
import { AlertCardSkeleton } from "./monitoring-skeleton";
import { StackTraceViewer } from "./stack-trace-viewer";

export interface ErrorDetailsDrawerProps {
  errorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ErrorDetailsDrawer({ errorId, open, onOpenChange }: ErrorDetailsDrawerProps) {
  const { data: error, isLoading } = useTrackedError(errorId ?? undefined);

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={error ? error.message : "Error details"}
      size="lg"
    >
      {isLoading ? <AlertCardSkeleton /> : null}
      {!isLoading && error ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={ERROR_STATUS_TONE[error.status]} size="sm" dot>
              {error.status}
            </StatusBadge>
            <StatusBadge tone="neutral" size="sm">
              {SERVICE_LABELS[error.service]}
            </StatusBadge>
            <StatusBadge tone="info" size="sm">
              {error.environment}
            </StatusBadge>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Occurrences</dt>
              <dd className="tabular-nums text-foreground">{error.count}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Browser</dt>
              <dd className="text-foreground">{error.browser ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">First seen</dt>
              <dd className="text-foreground">{formatTimestamp(error.firstSeenAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last seen</dt>
              <dd className="text-foreground">{formatTimestamp(error.lastSeenAt)}</dd>
            </div>
          </dl>

          {Object.keys(error.metadata).length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Metadata</h3>
              <dl className="grid gap-2 rounded-lg border border-border p-3 text-sm">
                {Object.entries(error.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-mono text-xs text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Stack trace</h3>
            <StackTraceViewer stackTrace={error.stackTrace} />
          </div>
        </div>
      ) : null}
    </DetailDrawer>
  );
}

export { ErrorDetailsDrawer };
