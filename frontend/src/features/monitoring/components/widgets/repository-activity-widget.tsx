"use client";

import { WidgetCard } from "@/components/dashboard";

import { useAnalytics } from "../../hooks/use-monitoring";

const RepositoryActivityWidget = function RepositoryActivityWidget() {
  const { data, isLoading, isError, refetch } = useAnalytics();

  return (
    <WidgetCard
      title="Repository activity"
      loading={isLoading}
      error={isError ? "Could not load repository activity" : undefined}
      onRetry={() => void refetch()}
      empty={!data}
    >
      {data ? (
        <div className="flex flex-col gap-2">
          <p className="text-3xl font-semibold tabular-nums text-foreground">
            {data.repoActivity}
          </p>
          <p className="text-sm text-muted-foreground">
            Commits, PRs, and releases in the selected period
          </p>
        </div>
      ) : null}
    </WidgetCard>
  );
};

export { RepositoryActivityWidget };
