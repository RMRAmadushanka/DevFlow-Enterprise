import type * as React from "react";
import type { ColumnDef, DataTableProps } from "@/components/data-display/table";
import type { WidgetStateProps } from "@/components/dashboard/shared/types";

export type { ColumnDef };

export interface DashboardTableProps<TData>
  extends Omit<DataTableProps<TData>, "density" | "empty">,
    WidgetStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Compact dashboard density. @default true */
  compact?: boolean;
  className?: string;
  onRetry?: () => void;
}
