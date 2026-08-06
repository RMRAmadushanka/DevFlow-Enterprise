"use client";

import {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
} from "@/components/data-display/skeleton";

function RepositorySkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading repository"
    >
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="size-6 rounded-full" />
      </div>
    </div>
  );
}

function CommitSkeleton() {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading commit"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      <SkeletonText lines={1} />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function BranchSkeleton() {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading branch"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

function ReleaseSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading release"
    >
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <SkeletonText lines={2} />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

function CodeBrowserSkeleton() {
  return (
    <div
      className="grid gap-4 lg:grid-cols-[240px_1fr]"
      aria-busy="true"
      aria-label="Loading code browser"
    >
      <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="rounded-xl border border-border p-4">
        <Skeleton className="mb-4 h-5 w-48" />
        <SkeletonText lines={12} />
      </div>
    </div>
  );
}

function PrSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading pull request"
    >
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

function RepositoryTableSkeleton() {
  return <SkeletonTable rows={6} columns={7} />;
}

function RepositoryGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <RepositorySkeleton />
      <RepositorySkeleton />
      <RepositorySkeleton />
      <SkeletonCard />
    </div>
  );
}

export {
  RepositorySkeleton,
  CommitSkeleton,
  BranchSkeleton,
  ReleaseSkeleton,
  CodeBrowserSkeleton,
  PrSkeleton,
  RepositoryTableSkeleton,
  RepositoryGridSkeleton,
};
