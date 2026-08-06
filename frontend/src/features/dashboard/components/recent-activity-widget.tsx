"use client";

import * as React from "react";

import { DashboardTimeline } from "@/components/dashboard";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";

import { useDashboardActivity } from "../hooks/use-dashboard-metrics";

const RecentActivityWidget = React.memo(function RecentActivityWidget() {
  const { data = [], isLoading, isError, refetch } = useDashboardActivity();

  const items = React.useMemo(
    () =>
      data.map((item) => ({
        id: item.id,
        title: `${item.userName} ${item.action}`,
        description: [item.description, item.meta].filter(Boolean).join(" · "),
        timestamp: formatRelativeTime(item.timestamp),
      })),
    [data]
  );

  return (
    <DashboardTimeline
      title="Recent activity"
      description="Timeline of engineering events"
      items={items}
      loading={isLoading}
      empty={!isLoading && !isError && items.length === 0}
      error={isError ? "Could not load timeline" : undefined}
      onRetry={() => void refetch()}
    />
  );
});

export { RecentActivityWidget };
