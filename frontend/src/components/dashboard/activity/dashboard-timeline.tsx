"use client";

import * as React from "react";

import { Timeline } from "@/components/data-display/timeline";
import { WidgetCard } from "@/components/dashboard/widgets";
import { DashboardEmptyState } from "@/components/dashboard/widgets";
import type { DashboardTimelineProps } from "./types";

/**
 * Deployment / release timeline for dashboard side panels.
 */
function DashboardTimeline({
  items,
  orientation = "vertical",
  title = "Timeline",
  description,
  actions,
  loading,
  empty,
  error,
  onRetry,
  className,
  label = "Timeline",
}: DashboardTimelineProps) {
  const isEmpty = empty ?? items.length === 0;

  return (
    <WidgetCard
      title={title}
      description={description}
      actions={actions}
      loading={loading}
      empty={!loading && !error && isEmpty}
      error={error}
      onRetry={onRetry}
      emptyState={<DashboardEmptyState variant="no-activity" title="No events" />}
      className={className}
    >
      <Timeline items={items} orientation={orientation} label={label} />
    </WidgetCard>
  );
}

export { DashboardTimeline };
