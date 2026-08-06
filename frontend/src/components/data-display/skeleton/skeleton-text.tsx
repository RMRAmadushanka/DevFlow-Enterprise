import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { SkeletonTextProps } from "./types";

/** A paragraph placeholder — full-width lines with a shorter final line. */
function SkeletonText({ lines = 3, lastLineWidth = "70%", className }: SkeletonTextProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-3.5 w-full"
          style={index === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
}

export { SkeletonText };
