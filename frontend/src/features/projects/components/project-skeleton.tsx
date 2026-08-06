"use client";

import {
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
  SkeletonChart,
} from "@/components/data-display/skeleton";

function ProjectCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-border p-5"
      aria-busy="true"
      aria-label="Loading project"
    >
      <div className="flex items-start gap-3">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <SkeletonText lines={2} />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

function ProjectTableSkeleton() {
  return <SkeletonTable rows={6} columns={7} aria-label="Loading projects" />;
}

function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading project">
      <div className="flex items-start gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-64" />
          <SkeletonText lines={2} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonChart height={220} />
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading analytics">
      <SkeletonChart height={240} />
      <SkeletonChart height={240} />
      <SkeletonChart height={240} />
      <SkeletonChart height={240} />
    </div>
  );
}

export {
  ProjectCardSkeleton,
  ProjectTableSkeleton,
  ProjectGridSkeleton,
  ProjectDetailSkeleton,
  AnalyticsSkeleton,
  ProjectDetailSkeleton as ProjectSkeleton,
};
