"use client";

import {
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
} from "@/components/data-display/skeleton";

function TaskSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
      aria-busy="true"
      aria-label="Loading task"
    >
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="size-6 rounded-md" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <SkeletonText lines={2} />
      <div className="flex items-center gap-2">
        <SkeletonAvatar size="sm" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

function BoardSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div
      className="flex gap-4 overflow-hidden pb-4"
      aria-busy="true"
      aria-label="Loading board"
    >
      {Array.from({ length: columns }, (_, index) => (
        <div key={index} className="flex w-72 shrink-0 flex-col gap-3">
          <Skeleton className="h-8 w-full rounded-lg" />
          <TaskSkeleton />
          <TaskSkeleton />
        </div>
      ))}
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading task details">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-4/5" />
          <SkeletonText lines={3} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}

function CommentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading comments">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex gap-3">
          <SkeletonAvatar size="default" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <SkeletonText lines={2} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return <SkeletonTable rows={8} columns={10} aria-label="Loading tasks" />;
}

export { TaskSkeleton, BoardSkeleton, DrawerSkeleton, CommentSkeleton, TableSkeleton };
