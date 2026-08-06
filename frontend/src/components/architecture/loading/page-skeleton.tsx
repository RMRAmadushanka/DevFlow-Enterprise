import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonTable, SkeletonCard, SkeletonChart } from "@/components/data-display/skeleton";

export type PageSkeletonVariant = "list" | "detail" | "dashboard" | "form" | "settings";

export interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
  className?: string;
}

/**
 * Route-level loading placeholder. Feature folders may wrap this
 * (e.g. `ProjectsSkeleton`) with domain-specific density.
 */
function PageSkeleton({ variant = "list", className }: PageSkeletonProps) {
  return (
    <div
      data-slot="page-skeleton"
      data-variant={variant}
      aria-busy="true"
      aria-label="Loading page"
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {variant === "list" ? <SkeletonTable rows={8} columns={5} /> : null}

      {variant === "detail" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full max-w-md" />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={3} />
          </div>
          <SkeletonCard lines={5} />
        </div>
      ) : null}

      {variant === "dashboard" ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} lines={2} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <SkeletonChart variant="line" height={220} />
            <SkeletonChart variant="bar" height={220} />
          </div>
        </div>
      ) : null}

      {variant === "form" ? (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <Skeleton className="h-9 w-32 self-end" />
        </div>
      ) : null}

      {variant === "settings" ? (
        <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <SkeletonCard lines={6} />
        </div>
      ) : null}
    </div>
  );
}

export { PageSkeleton };
