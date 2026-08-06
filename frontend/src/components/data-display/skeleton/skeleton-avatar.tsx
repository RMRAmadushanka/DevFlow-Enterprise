import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { SkeletonAvatarProps } from "./types";

const sizeClassName: Record<NonNullable<SkeletonAvatarProps["size"]>, string> = {
  sm: "size-6",
  default: "size-8",
  lg: "size-10",
};

/** A circular placeholder matching `Avatar`'s three sizes. */
function SkeletonAvatar({ size = "default", className }: SkeletonAvatarProps) {
  return <Skeleton className={cn("shrink-0 rounded-full", sizeClassName[size], className)} aria-hidden="true" />;
}

export { SkeletonAvatar };
