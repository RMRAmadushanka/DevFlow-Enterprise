"use client";

import { Clock, Eye, GitBranch, MessageSquare, Users } from "lucide-react";

import { MetricCard } from "@/components/dashboard/cards";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";

import type { DocumentAnalytics as DocumentAnalyticsData } from "../types/document.types";

export interface DocumentAnalyticsProps {
  analytics: DocumentAnalyticsData;
  className?: string;
}

function DocumentAnalytics({ analytics, className }: DocumentAnalyticsProps) {
  return (
    <div
      className={className}
      data-slot="document-analytics"
      aria-label="Document analytics"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Views"
          value={analytics.views}
          icon={<Eye className="size-4" aria-hidden />}
        />
        <MetricCard
          title="Comments"
          value={analytics.comments}
          icon={<MessageSquare className="size-4" aria-hidden />}
        />
        <MetricCard
          title="Versions"
          value={analytics.versions}
          icon={<GitBranch className="size-4" aria-hidden />}
        />
        <MetricCard
          title="Editors"
          value={analytics.editors}
          icon={<Users className="size-4" aria-hidden />}
        />
        <MetricCard
          title="Reading time"
          value={`${analytics.readingTimeMinutes} min`}
          icon={<Clock className="size-4" aria-hidden />}
        />
        <MetricCard
          title="Last updated"
          value={formatRelativeTime(analytics.lastUpdated)}
          icon={<Clock className="size-4" aria-hidden />}
        />
      </div>
    </div>
  );
}

export { DocumentAnalytics };
