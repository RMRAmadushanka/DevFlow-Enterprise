"use client";

import {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
} from "@/components/data-display/skeleton";

function MonitoringSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading monitoring">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <SkeletonTable rows={5} columns={4} />
    </div>
  );
}

function MetricChartSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading chart"
    >
      <Skeleton className="h-5 w-40" />
      <SkeletonText lines={1} />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

function AlertCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading alert"
    >
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}

function ServiceGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return <SkeletonTable rows={rows} columns={5} />;
}

export {
  MonitoringSkeleton,
  MetricChartSkeleton,
  AlertCardSkeleton,
  ServiceGridSkeleton,
  TableSkeleton,
};
