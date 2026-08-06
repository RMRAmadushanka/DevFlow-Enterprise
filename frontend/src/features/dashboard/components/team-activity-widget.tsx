"use client";

import * as React from "react";

import { ActivityFeed } from "@/components/dashboard";

import { useDashboardActivity } from "../hooks/use-dashboard-metrics";

const TeamActivityWidget = React.memo(function TeamActivityWidget() {
  const { data = [], isLoading, isError, refetch } = useDashboardActivity();

  const items = React.useMemo(
    () =>
      data.map((item) => ({
        id: item.id,
        user: { name: item.userName, imageUrl: item.userAvatarUrl },
        action: item.action,
        description: item.description,
        timestamp: item.timestamp,
        meta: item.meta,
      })),
    [data]
  );

  return (
    <ActivityFeed
      title="Team activity"
      items={items}
      loading={isLoading}
      empty={!isLoading && !isError && items.length === 0}
      error={isError ? "Could not load activity" : undefined}
      onRetry={() => void refetch()}
      label="Recent team actions"
    />
  );
});

export { TeamActivityWidget };
