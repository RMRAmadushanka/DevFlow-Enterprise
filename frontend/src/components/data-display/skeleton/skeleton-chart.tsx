import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { SkeletonChartProps } from "./types";

/** Fixed (non-random) relative bar heights so server- and client-rendered markup match. */
const barHeights = [45, 70, 55, 90, 65, 80, 50, 75];

/** A placeholder for chart components, rendered while data is loading. Charts themselves are a separate system — this only reserves their visual footprint. */
function SkeletonChart({ variant = "bar", height = 160, className }: SkeletonChartProps) {
  if (variant === "pie") {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }} aria-hidden="true">
        <Skeleton className="aspect-square rounded-full" style={{ height: height * 0.9 }} />
      </div>
    );
  }

  if (variant === "line") {
    return (
      <div className={cn("relative overflow-hidden rounded-lg", className)} style={{ height }} aria-hidden="true">
        <Skeleton className="absolute inset-0" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-end gap-2", className)} style={{ height }} aria-hidden="true">
      {barHeights.map((pct, index) => (
        <Skeleton key={index} className="flex-1 rounded-t-md rounded-b-none" style={{ height: `${pct}%` }} />
      ))}
    </div>
  );
}

export { SkeletonChart };
