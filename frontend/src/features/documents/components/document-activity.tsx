"use client";

import { ActivityFeed } from "@/components/dashboard/activity";

import type { DocumentActivityItem } from "../types/document.types";

export interface DocumentActivityProps {
  items: DocumentActivityItem[];
  loading?: boolean;
  title?: string;
  className?: string;
}

function DocumentActivity({
  items,
  loading,
  title = "Activity",
  className,
}: DocumentActivityProps) {
  return (
    <ActivityFeed
      title={title}
      className={className}
      loading={loading}
      empty={!loading && items.length === 0}
      items={items.map((item) => ({
        id: item.id,
        action: item.summary,
        description: item.actorName,
        timestamp: item.timestamp,
      }))}
    />
  );
}

export { DocumentActivity };
