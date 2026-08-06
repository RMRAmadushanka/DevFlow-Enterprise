import type * as React from "react";
import type { FeedbackTone } from "@/components/feedback/shared/types";

export interface AlertBannerProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: Exclude<FeedbackTone, "neutral"> | "neutral";
  icon?: React.ReactNode;
  action?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export type StatusMessageVariant = "loading" | "success" | "error" | "empty";

export interface StatusMessageProps {
  variant: StatusMessageVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}
