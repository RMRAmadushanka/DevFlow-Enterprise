import type * as React from "react";

export type StepStatus = "completed" | "active" | "pending" | "error";

export interface StepItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  status?: StepStatus;
  optional?: boolean;
}

export interface StepperProps {
  steps: StepItem[];
  /** Current step index (0-based). Ignored when steps provide explicit `status`. */
  current?: number;
  orientation?: "horizontal" | "vertical";
  onStepClick?: (index: number) => void;
  className?: string;
  /** Accessible name. @default "Progress" */
  label?: string;
}
