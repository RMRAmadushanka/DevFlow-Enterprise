import type * as React from "react";
import type { SystemStatus, WidgetStateProps } from "@/components/dashboard/shared/types";

export interface SystemStatusItem {
  id: string;
  name: string;
  status: SystemStatus;
  description?: React.ReactNode;
  meta?: React.ReactNode;
}

export interface SystemStatusWidgetProps extends WidgetStateProps {
  title?: React.ReactNode;
  items: SystemStatusItem[];
  actions?: React.ReactNode;
  className?: string;
  onRetry?: () => void;
}

export interface LiveIndicatorProps {
  label?: string;
  /** When false, shows a muted "Offline" / paused state. @default true */
  live?: boolean;
  className?: string;
}
