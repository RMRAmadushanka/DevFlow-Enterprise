"use client";

import { Skeleton, SkeletonAvatar, SkeletonTable, SkeletonText } from "@/components/data-display/skeleton";

function OrganizationCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-border p-5"
      data-slot="organization-card-skeleton"
      aria-busy="true"
      aria-label="Loading organization"
    >
      <div className="flex items-start gap-3">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <SkeletonText lines={2} />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function MemberTableSkeleton() {
  return <SkeletonTable rows={5} columns={5} aria-label="Loading members" />;
}

function OrganizationSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading settings">
      <Skeleton className="h-8 w-48" />
      <SkeletonText lines={4} />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function OrganizationGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <OrganizationCardSkeleton key={index} />
      ))}
    </div>
  );
}

export {
  OrganizationCardSkeleton,
  MemberTableSkeleton,
  OrganizationSettingsSkeleton,
  OrganizationGridSkeleton,
};
