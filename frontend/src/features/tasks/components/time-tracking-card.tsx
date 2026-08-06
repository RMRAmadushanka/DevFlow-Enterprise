"use client";

import { ProgressBar } from "@/components/data-display/progress";

import type { TaskTimeTracking } from "../types/task.types";
import { formatMinutes } from "../utils/format";

export interface TimeTrackingCardProps {
  timeTracking: TaskTimeTracking;
}

function TimeTrackingCard({ timeTracking }: TimeTrackingCardProps) {
  const { estimatedMinutes, loggedMinutes } = timeTracking;
  const remaining = Math.max(estimatedMinutes - loggedMinutes, 0);
  const progress =
    estimatedMinutes > 0 ? Math.min(Math.round((loggedMinutes / estimatedMinutes) * 100), 100) : 0;

  return (
    <div
      className="space-y-4 rounded-lg border border-border bg-card p-4"
      data-slot="time-tracking-card"
    >
      <h3 className="text-sm font-semibold text-foreground">Time tracking</h3>
      <dl className="grid grid-cols-3 gap-3 text-center">
        <div>
          <dt className="text-xs text-muted-foreground">Estimated</dt>
          <dd className="text-sm font-medium tabular-nums">{formatMinutes(estimatedMinutes)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Logged</dt>
          <dd className="text-sm font-medium tabular-nums">{formatMinutes(loggedMinutes)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Remaining</dt>
          <dd className="text-sm font-medium tabular-nums">{formatMinutes(remaining)}</dd>
        </div>
      </dl>
      <ProgressBar value={progress} label="Time logged" showValue animated={false} />
    </div>
  );
}

export { TimeTrackingCard };
