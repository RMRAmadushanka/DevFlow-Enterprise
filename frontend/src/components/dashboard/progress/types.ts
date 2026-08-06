import type * as React from "react";
import type { Tone } from "@/components/dashboard/shared/types";
import type { WidgetStateProps } from "@/components/dashboard/shared/types";

export interface ProgressWidgetProps extends WidgetStateProps {
  title: string;
  description?: React.ReactNode;
  /** Current progress 0–100. */
  value: number;
  /** Optional goal label shown beside the percentage. */
  goal?: React.ReactNode;
  /** Current absolute value (e.g. "18 of 25"). */
  currentLabel?: React.ReactNode;
  tone?: Tone;
  className?: string;
  actions?: React.ReactNode;
  onRetry?: () => void;
}
