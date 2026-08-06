import type * as React from "react";
import type { FeedbackAction, OverlayOpenProps } from "@/components/feedback/shared/types";

export interface QuickDialogProps extends OverlayOpenProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Primary action. */
  action?: FeedbackAction;
  /** Secondary/dismiss action. @default "Close" */
  dismissLabel?: React.ReactNode;
  className?: string;
}
