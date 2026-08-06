"use client";

import * as React from "react";
import Link from "next/link";
import { Package } from "lucide-react";

import { WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { useReleases } from "../../hooks/use-sprints";
import { ReleaseCard } from "../release-card";

const RecentReleasesWidget = React.memo(function RecentReleasesWidget({
  projectId,
}: {
  projectId?: string | null;
}) {
  const { data, isLoading, isError, refetch } = useReleases(projectId);
  const recent = (data ?? []).slice(0, 3);

  return (
    <WidgetCard
      title="Recent releases"
      description="Latest shipped versions"
      icon={<Package className="size-4" />}
      loading={isLoading}
      empty={!isLoading && recent.length === 0}
      error={isError ? "Could not load releases" : undefined}
      onRetry={() => void refetch()}
      actions={
        projectId ? (
          <Button
            render={<Link href={routes.app.projectReleases(projectId)} />}
            size="sm"
            variant="outline"
          >
            View all
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3">
        {recent.map((release) => (
          <ReleaseCard key={release.id} release={release} />
        ))}
      </div>
    </WidgetCard>
  );
});

export { RecentReleasesWidget };
