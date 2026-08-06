"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";

import { cn } from "@/lib/utils";
import { ProgressTrack } from "@/components/ui/progress";
import { duration, easing } from "@/design-system/tokens/motion";
import type { Tone } from "@/components/data-display/shared/types";
import type { ProgressBarProps } from "./types";

const toneClassName: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-primary",
  neutral: "bg-muted-foreground",
};

const trackSizeClassName: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
};

/**
 * A labeled linear progress meter. Built on the `Progress` primitive
 * (Base UI) with the shared tone palette and a Framer Motion fill-in
 * animation — use `animated={false}` inside lists that re-render often
 * (e.g. a virtualized table column) to avoid replaying the animation.
 */
function ProgressBar({ value, label, showValue = true, tone = "info", size = "md", animated = true, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <ProgressPrimitive.Root value={clamped} data-slot="progress" className={cn("flex w-full flex-col gap-1.5", className)}>
      {label || showValue ? (
        <div className="flex w-full items-center justify-between text-sm">
          {label ? <span className="font-medium text-foreground">{label}</span> : <span />}
          {showValue ? <span className="text-muted-foreground tabular-nums">{Math.round(clamped)}%</span> : null}
        </div>
      ) : null}
      <ProgressTrack className={trackSizeClassName[size]}>
        <motion.div
          data-slot="progress-indicator"
          className={cn("h-full rounded-full", toneClassName[tone])}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: duration.slow, ease: easing.decelerate }}
        />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

export { ProgressBar };
