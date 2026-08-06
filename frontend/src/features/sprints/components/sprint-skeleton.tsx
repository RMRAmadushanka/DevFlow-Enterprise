"use client";

import {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
} from "@/components/data-display/skeleton";

function SprintSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading sprint"
    >
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

function PlanningSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading planning board">
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <Skeleton className="h-6 w-40" />
          <SprintSkeleton />
          <SprintSkeleton />
        </div>
      ))}
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading reports">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="rounded-xl border border-border p-4"
      style={{ minHeight: height }}
      aria-busy="true"
      aria-label="Loading chart"
    >
      <Skeleton className="mb-4 h-5 w-36" />
      <Skeleton className="h-[220px] w-full rounded-lg" />
    </div>
  );
}

function SprintTableSkeleton() {
  return <SkeletonTable rows={6} columns={6} />;
}

export { SprintSkeleton, PlanningSkeleton, ReportSkeleton, ChartSkeleton, SprintTableSkeleton };
