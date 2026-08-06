import * as React from "react";

import { PageSkeleton } from "@/components/architecture/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonAvatar, SkeletonTable } from "@/components/data-display/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function LoginSkeleton() {
  return <PageSkeleton variant="form" className="max-w-md" />;
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading profile">
      <Card>
        <CardContent className="flex items-center gap-4">
          <SkeletonAvatar size="lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </CardContent>
      </Card>
      <PageSkeleton variant="form" />
    </div>
  );
}

function SettingsSkeleton() {
  return <PageSkeleton variant="settings" />;
}

function SessionSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading sessions">
      <SkeletonTable rows={4} columns={5} />
    </div>
  );
}

export { LoginSkeleton, ProfileSkeleton, SettingsSkeleton, SessionSkeleton };
