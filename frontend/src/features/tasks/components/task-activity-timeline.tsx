"use client";

import * as React from "react";

import { ActivityFeed } from "@/components/dashboard/activity";
import type { ActivityItem } from "@/components/dashboard/activity";

import type { TaskActivityItem } from "../types/task.types";

export interface TaskActivityTimelineProps {
  items: TaskActivityItem[];
  loading?: boolean;
  limit?: number;
}

function toActivityItems(items: TaskActivityItem[]): ActivityItem[] {
  return items.map((item) => ({
    id: item.id,
    user: { id: item.actorName, name: item.actorName },
    action: item.summary,
    description: item.meta,
    timestamp: item.timestamp,
  }));
}

function TaskActivityTimeline({ items, loading, limit }: TaskActivityTimelineProps) {
  const visible = limit ? items.slice(0, limit) : items;

  return (
    <ActivityFeed
      items={toActivityItems(visible)}
      loading={loading}
      title="Activity"
      label="Task activity"
      className="border-0 shadow-none"
    />
  );
}

export { TaskActivityTimeline };
