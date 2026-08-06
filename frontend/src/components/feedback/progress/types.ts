import type * as React from "react";
import type { Tone } from "@/components/data-display/shared/types";

export interface ProgressIndicatorProps {
  value: number;
  /** @default "linear" */
  variant?: "linear" | "circular";
  label?: React.ReactNode;
  showValue?: boolean;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}
