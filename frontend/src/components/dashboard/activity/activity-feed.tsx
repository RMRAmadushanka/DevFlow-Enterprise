"use client";

import * as React from "react";

import { ActivityTimeline } from "@/components/data-display/activity";
import { WidgetCard } from "@/components/dashboard/widgets";
import { DashboardEmptyState } from "@/components/dashboard/widgets";
import type { ActivityFeedProps } from "./types";

/**
 * Dashboard activity feed — avatar, action, relative time, metadata.
 * Wraps the shared data-display ActivityTimeline inside WidgetCard chrome.
 */
function ActivityFeed({
  items,
  density = "comfortable",
  loading,
  empty,
  error,
  title = "Activity",
  actions,
  className,
  label = "Activity",
  onRetry,
}: ActivityFeedProps) {
  const isEmpty = empty ?? items.length === 0;

  return (
    <WidgetCard
      title={title}
      actions={actions}
      loading={loading}
      empty={!loading && !error && isEmpty}
      error={error}
      onRetry={onRetry}
      emptyState={<DashboardEmptyState variant="no-activity" />}
      className={className}
      contentClassName="p-0"
    >
      <ActivityTimeline items={items} density={density} label={label} className="px-(--card-spacing)" />
    </WidgetCard>
  );
}

export { ActivityFeed };
