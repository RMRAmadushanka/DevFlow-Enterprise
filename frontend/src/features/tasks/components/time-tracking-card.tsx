"use client";

import * as React from "react";

import { ProgressBar } from "@/components/data-display/progress";
import { TextInput } from "@/components/forms/input";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import { useLogTime } from "../hooks/use-tasks";
import type { TaskTimeTracking } from "../types/task.types";
import { formatMinutes } from "../utils/format";

export interface TimeTrackingCardProps {
  taskId: string;
  timeTracking: TaskTimeTracking;
  readOnly?: boolean;
}

function TimeTrackingCard({ taskId, timeTracking, readOnly }: TimeTrackingCardProps) {
  const logTime = useLogTime(taskId);
  const [minutes, setMinutes] = React.useState("");
  const [note, setNote] = React.useState("");

  const { estimatedMinutes, loggedMinutes } = timeTracking;
  const remaining = Math.max(estimatedMinutes - loggedMinutes, 0);
  const progress =
    estimatedMinutes > 0 ? Math.min(Math.round((loggedMinutes / estimatedMinutes) * 100), 100) : 0;

  async function handleLog() {
    const value = Number(minutes);
    if (!Number.isFinite(value) || value < 1) return;
    await logTime.mutateAsync({ minutes: value, note: note.trim() || undefined });
    setMinutes("");
    setNote("");
  }

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

      {!readOnly ? (
        <PermissionGuard permission="task.update">
          <div className="space-y-2 border-t border-border pt-3">
            <TextInput
              label="Log minutes"
              value={minutes}
              onChange={setMinutes}
              placeholder="30"
            />
            <TextInput
              label="Note (optional)"
              value={note}
              onChange={setNote}
              placeholder="What did you work on?"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => void handleLog()}
              disabled={logTime.isPending}
            >
              Log time
            </Button>
          </div>
        </PermissionGuard>
      ) : null}
    </div>
  );
}

export { TimeTrackingCard };
