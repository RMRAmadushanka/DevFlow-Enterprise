"use client";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { SkeletonText } from "@/components/data-display/skeleton";

import { useOrganizationActivity } from "../hooks/use-organizations";

export interface RecentActivityProps {
  organizationId: string;
}

function RecentActivity({ organizationId }: RecentActivityProps) {
  const { data = [], isLoading, isError } = useOrganizationActivity(organizationId);

  if (isLoading) return <SkeletonText lines={4} />;

  if (isError) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Could not load activity"
        description="Recent organization events are unavailable."
      />
    );
  }

  if (data.length === 0) {
    return (
      <FeatureEmptyState
        variant="no-data"
        title="No recent activity"
        description="Organization events will appear here."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Recent activity">
      {data.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-foreground">
            <span className="font-medium">{item.actorName}</span> {item.action}{" "}
            <span className="font-medium">{item.target}</span>
          </p>
          <time className="text-xs text-muted-foreground" dateTime={item.createdAt}>
            {formatRelativeTime(item.createdAt)}
          </time>
        </li>
      ))}
    </ul>
  );
}

export { RecentActivity };
