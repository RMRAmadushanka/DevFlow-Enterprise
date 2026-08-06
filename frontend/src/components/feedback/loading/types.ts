import type * as React from "react";
import type { DisplaySize } from "@/components/data-display/shared/types";

export interface LoadingSpinnerProps {
  size?: DisplaySize;
  label?: string;
  className?: string;
}

export interface FeedbackLoadingOverlayProps {
  visible: boolean;
  label?: React.ReactNode;
  /** Full-viewport fixed overlay vs. absolute parent cover. @default "local" */
  mode?: "local" | "page";
  blur?: boolean;
  className?: string;
}
