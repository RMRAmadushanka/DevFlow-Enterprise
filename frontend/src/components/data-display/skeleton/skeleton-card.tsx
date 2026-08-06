import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { SkeletonAvatar } from "./skeleton-avatar";
import { SkeletonText } from "./skeleton-text";
import type { SkeletonCardProps } from "./types";

/** A placeholder matching `DataCard`'s default layout — image/avatar, title, and body lines. */
function SkeletonCard({ showAvatar, showImage, lines = 2, className }: SkeletonCardProps) {
  return (
    <Card className={cn("gap-3", className)} aria-hidden="true">
      {showImage ? <Skeleton className="h-32 w-full rounded-none" /> : null}
      <CardHeader className="gap-2">
        {showAvatar ? <SkeletonAvatar /> : null}
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <SkeletonText lines={lines} />
      </CardContent>
    </Card>
  );
}

export { SkeletonCard };
