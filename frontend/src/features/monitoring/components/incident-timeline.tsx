"use client";

import { ActivityTimeline } from "@/components/data-display/activity";

import type { IncidentEvent } from "../types/monitoring.types";

export interface IncidentTimelineProps {
  events: IncidentEvent[];
  loading?: boolean;
  className?: string;
}

function IncidentTimeline({ events, loading, className }: IncidentTimelineProps) {
  const items = events.map((event) => ({
    id: event.id,
    action: event.summary,
    description: event.type,
    timestamp: event.timestamp,
    user: { id: event.actorName, name: event.actorName },
  }));

  return (
    <div className={className} data-slot="incident-timeline">
      <ActivityTimeline
        items={items}
        loading={loading}
        empty={<p className="text-sm text-muted-foreground">No timeline events yet.</p>}
        label="Incident timeline"
      />
    </div>
  );
}

export { IncidentTimeline };
