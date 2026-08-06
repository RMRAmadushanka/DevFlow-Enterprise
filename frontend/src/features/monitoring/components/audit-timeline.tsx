"use client";

import { ActivityTimeline } from "@/components/data-display/activity";

import type { AuditLogEntry } from "../types/monitoring.types";

export interface AuditTimelineProps {
  entries: AuditLogEntry[];
  loading?: boolean;
  className?: string;
}

function AuditTimeline({ entries, loading, className }: AuditTimelineProps) {
  const items = entries.map((entry) => ({
    id: entry.id,
    action: entry.action,
    description: `${entry.resourceType}: ${entry.resource}`,
    timestamp: entry.timestamp,
    user: { id: entry.userId, name: entry.userName },
    meta: entry.status,
  }));

  return (
    <div className={className} data-slot="audit-timeline">
      <ActivityTimeline
        items={items}
        loading={loading}
        empty={<p className="text-sm text-muted-foreground">No audit activity.</p>}
        label="Audit timeline"
      />
    </div>
  );
}

export { AuditTimeline };
