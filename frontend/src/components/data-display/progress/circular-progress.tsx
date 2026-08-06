"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { duration, easing } from "@/design-system/tokens/motion";
import type { Tone } from "@/components/data-display/shared/types";
import type { CircularProgressProps } from "./types";

const toneStrokeClassName: Record<Tone, string> = {
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
  info: "stroke-primary",
  neutral: "stroke-muted-foreground",
};

/** A ring-shaped progress meter — for compact dashboards/cards where a full-width `ProgressBar` doesn't fit. */
function CircularProgress({
  value,
  size = 64,
  strokeWidth = 6,
  tone = "info",
  showValue = true,
  label,
  animated = true,
  className,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${Math.round(clamped)}%`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={toneStrokeClassName[tone]}
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: duration.slower, ease: easing.decelerate }}
        />
      </svg>
      {showValue ? (
        <span className="absolute text-sm font-medium tabular-nums text-foreground">{Math.round(clamped)}%</span>
      ) : null}
    </div>
  );
}

export { CircularProgress };
