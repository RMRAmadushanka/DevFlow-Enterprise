import type * as React from "react";
import type { ColumnDef, Row, RowSelectionState, SortingState, OnChangeFn } from "@tanstack/react-table";

export interface EnterpriseDataGridProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  getRowId?: (originalRow: TData, index: number) => string;

  /** Estimated row height for the virtualizer. @default 44 */
  estimateSize?: number;
  /** Viewport height. @default 480 */
  height?: number | string;
  /** Number of columns pinned to the start. @default 0 */
  stickyColumnCount?: number;

  enableSorting?: boolean;
  enableRowSelection?: boolean;
  enableColumnResizing?: boolean;

  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  loading?: boolean;
  empty?: React.ReactNode;
  /** Per-row inline actions rendered in a trailing sticky column. */
  renderRowActions?: (row: Row<TData>) => React.ReactNode;
  className?: string;
  "aria-label"?: string;
}
