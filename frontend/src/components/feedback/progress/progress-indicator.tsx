"use client";

import * as React from "react";

import { ProgressBar, CircularProgress } from "@/components/data-display/progress";
import type { ProgressIndicatorProps } from "./types";

/**
 * Unified progress indicator — linear or circular — wrapping the
 * data-display progress primitives.
 */
function ProgressIndicator({
  value,
  variant = "linear",
  label,
  showValue = true,
  tone = "neutral",
  size = "md",
  animated = true,
  className,
}: ProgressIndicatorProps) {
  if (variant === "circular") {
    const diameter = size === "sm" ? 40 : size === "lg" ? 80 : 64;
    return (
      <CircularProgress
        value={value}
        label={typeof label === "string" ? label : undefined}
        showValue={showValue}
        tone={tone}
        size={diameter}
        animated={animated}
        className={className}
      />
    );
  }

  return (
    <ProgressBar
      value={value}
      label={label}
      showValue={showValue}
      tone={tone}
      size={size}
      animated={animated}
      className={className}
    />
  );
}

export { ProgressIndicator };
