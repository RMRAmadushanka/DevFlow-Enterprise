"use client";

import * as React from "react";

import { ActivityFeed } from "@/components/dashboard";
import type { ActivityItem } from "@/components/data-display/activity";

import type { ProjectActivityItem } from "../types/project.types";
import { ProjectEmptyState } from "./project-empty-state";

export interface ProjectTimelineProps {
  items: ProjectActivityItem[];
  loading?: boolean;
  title?: string;
  className?: string;
}

function mapToActivityItems(items: ProjectActivityItem[]): ActivityItem[] {
  return items.map((item) => ({
    id: item.id,
    user: { name: item.actorName },
    action: item.summary,
    description: item.meta,
    timestamp: item.timestamp,
  }));
}

function ProjectTimeline({
  items,
  loading,
  title = "Project timeline",
  className,
}: ProjectTimelineProps) {
  const activityItems = React.useMemo(() => mapToActivityItems(items), [items]);

  if (!loading && items.length === 0) {
    return <ProjectEmptyState variant="no-activity" />;
  }

  return (
    <ActivityFeed
      items={activityItems}
      loading={loading}
      title={title}
      className={className}
      label="Project activity timeline"
    />
  );
}

export { ProjectTimeline };
