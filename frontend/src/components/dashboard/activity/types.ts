import type * as React from "react";
import type { ActivityItem, ActivityTimelineProps } from "@/components/data-display/activity";
import type { TimelineItemData, TimelineProps } from "@/components/data-display/timeline";
import type { WidgetStateProps } from "@/components/dashboard/shared/types";

export type { ActivityItem, TimelineItemData };

export interface ActivityFeedProps extends Omit<ActivityTimelineProps, "empty">, WidgetStateProps {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  onRetry?: () => void;
}

export interface DashboardTimelineProps extends TimelineProps, WidgetStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  onRetry?: () => void;
}
