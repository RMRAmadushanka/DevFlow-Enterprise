"use client";

import * as React from "react";
import { BarChart3, Inbox, Activity } from "lucide-react";

import { EmptyState } from "@/components/data-display/empty-state";
import type { DashboardEmptyStateProps } from "./types";

const presets: Record<
  NonNullable<DashboardEmptyStateProps["variant"]>,
  { icon: React.ReactNode; title: string; description: string }
> = {
  "no-data": {
    icon: <Inbox />,
    title: "No data available",
    description: "There is nothing to show for this widget yet.",
  },
  "no-metrics": {
    icon: <BarChart3 />,
    title: "No metrics found",
    description: "Metrics will appear here once data is available.",
  },
  "no-activity": {
    icon: <Activity />,
    title: "No activity",
    description: "Recent activity will show up here.",
  },
};

/**
 * Compact empty placeholder tuned for dashboard widgets.
 */
function DashboardEmptyState({
  variant = "no-data",
  title,
  description,
  icon,
  action,
  className,
}: DashboardEmptyStateProps) {
  const preset = presets[variant];

  return (
    <EmptyState
      variant="no-data"
      icon={icon ?? preset.icon}
      title={title ?? preset.title}
      description={description ?? preset.description}
      action={action}
      className={className}
    />
  );
}

export { DashboardEmptyState };
