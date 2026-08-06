"use client";

import { ActivityTimeline } from "@/components/data-display/activity";

import { useAlertHistory } from "../hooks/use-monitoring";
import { formatTimestamp } from "../utils/format";

export interface AlertHistoryProps {
  alertId: string | undefined;
  className?: string;
}

function AlertHistory({ alertId, className }: AlertHistoryProps) {
  const { data, isLoading } = useAlertHistory(alertId);

  const items =
    data?.map((entry) => ({
      id: entry.id,
      action: entry.summary,
      timestamp: entry.at,
      description: formatTimestamp(entry.at),
    })) ?? [];

  return (
    <div className={className} data-slot="alert-history">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Alert history</h3>
      <ActivityTimeline
        items={items}
        loading={isLoading}
        empty={<p className="text-sm text-muted-foreground">No history yet.</p>}
        label="Alert history"
      />
    </div>
  );
}

export { AlertHistory };
