import * as React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonChart, SkeletonTable, SkeletonCard } from "@/components/data-display/skeleton";
import type { DashboardSkeletonProps } from "./types";

/**
 * Loading placeholders for dashboard cards, charts, tables, and metrics.
 */
function DashboardSkeleton({ variant = "card", height = 200, className }: DashboardSkeletonProps) {
  if (variant === "chart") {
    return (
      <Card data-slot="dashboard-skeleton" aria-busy="true" aria-label="Loading chart" className={className}>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent>
          <SkeletonChart variant="line" height={height} />
        </CardContent>
      </Card>
    );
  }

  if (variant === "table") {
    return (
      <Card data-slot="dashboard-skeleton" aria-busy="true" aria-label="Loading table" className={className}>
        <CardHeader>
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent>
          <SkeletonTable rows={5} columns={4} />
        </CardContent>
      </Card>
    );
  }

  if (variant === "metric") {
    return (
      <Card data-slot="dashboard-skeleton" aria-busy="true" aria-label="Loading metric" className={className}>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div data-slot="dashboard-skeleton" aria-busy="true" aria-label="Loading widget" className={cn(className)}>
      <SkeletonCard showAvatar />
    </div>
  );
}

export { DashboardSkeleton };
