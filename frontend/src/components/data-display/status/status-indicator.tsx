import * as React from "react";

import { cn } from "@/lib/utils";
import type { Tone } from "@/components/data-display/shared/types";
import type { StatusIndicatorProps } from "./types";

const toneDotClassName: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-muted-foreground",
};

const toneTextClassName: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  neutral: "text-foreground",
};

const sizeClassName: Record<NonNullable<StatusIndicatorProps["size"]>, { dot: string; text: string }> = {
  sm: { dot: "size-1.5", text: "text-xs" },
  md: { dot: "size-2", text: "text-sm" },
  lg: { dot: "size-2.5", text: "text-base" },
};

/**
 * An inline `● Label` status line — for use in table cells, list rows, and
 * detail panes where a full pill (`StatusBadge`) would be too heavy. Colors
 * come from the shared five-tone palette so it always matches `StatusBadge`.
 */
function StatusIndicator({ tone = "neutral", label, icon, pulse, size = "md", className }: StatusIndicatorProps) {
  const { dot, text } = sizeClassName[size];

  return (
    <span className={cn("inline-flex items-center gap-1.5", text, className)}>
      {icon ? (
        <span className={cn("shrink-0 [&>svg]:size-3.5", toneTextClassName[tone])} aria-hidden="true">
          {icon}
        </span>
      ) : (
        <span className={cn("relative inline-flex shrink-0 rounded-full", dot)} aria-hidden="true">
          {pulse ? (
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", toneDotClassName[tone])} />
          ) : null}
          <span className={cn("relative inline-flex rounded-full", dot, toneDotClassName[tone])} />
        </span>
      )}
      <span className="text-foreground">{label}</span>
    </span>
  );
}

export { StatusIndicator };
