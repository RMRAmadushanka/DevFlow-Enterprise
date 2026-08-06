"use client";

import {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
} from "@/components/data-display/skeleton";

function DocumentSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading document"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="size-8 rounded-md" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading editor"
    >
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} className="size-8 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-8 w-2/3" />
      <SkeletonText lines={8} />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 p-3"
      aria-busy="true"
      aria-label="Loading document sidebar"
    >
      <Skeleton className="h-8 w-full rounded-md" />
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
      <Skeleton className="mt-2 h-4 w-20" />
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={`folder-${i}`} className="ml-4 h-4 w-24" />
      ))}
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-4" aria-busy="true" aria-label="Loading comment">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading version history">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-start justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function DocumentTableSkeleton() {
  return <SkeletonTable rows={6} columns={6} />;
}

function DocumentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading documents"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export {
  DocumentSkeleton,
  EditorSkeleton,
  SidebarSkeleton,
  CommentSkeleton,
  HistorySkeleton,
  DocumentTableSkeleton,
  DocumentGridSkeleton,
};
