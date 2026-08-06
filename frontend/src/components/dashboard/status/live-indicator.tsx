"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { StatusIndicator } from "@/components/data-display/status";
import type { LiveIndicatorProps } from "./types";

/**
 * Pulsing live / offline indicator for real-time dashboard surfaces.
 */
function LiveIndicator({ label = "Live", live = true, className }: LiveIndicatorProps) {
  return (
    <StatusIndicator
      tone={live ? "success" : "neutral"}
      label={live ? label : "Offline"}
      pulse={live}
      size="sm"
      className={cn("font-medium", className)}
    />
  );
}

export { LiveIndicator };
