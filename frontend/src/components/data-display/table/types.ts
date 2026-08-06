import type * as React from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnSizingState,
  ExpandedState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  Row,
  Table as TanStackTable,
} from "@tanstack/react-table";
import type { Density } from "@/components/data-display/shared/types";

export type { ColumnDef, SortingState, RowSelectionState, VisibilityState, ExpandedState };

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Unique row id. Defaults to the row index. */
  getRowId?: (originalRow: TData, index: number) => string;

  // Features
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableColumnResizing?: boolean;
  enableExpanding?: boolean;
  enablePagination?: boolean;
  stickyHeader?: boolean;

  // Controlled state (optional — uncontrolled by default)
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  columnSizing?: ColumnSizingState;
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>;
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;

  /** Manual (server-side) modes — skips client sorting/filtering/paging. */
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  rowCount?: number;

  // UI
  density?: Density;
  loading?: boolean;
  empty?: React.ReactNode;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  /** Noun used in the pagination summary, e.g. "projects". */
  noun?: string;
  /** Extra toolbar actions rendered after the built-in controls. */
  toolbarActions?: React.ReactNode;
  /** Bulk action bar shown when one or more rows are selected. */
  bulkActions?: (ctx: {
    selectedRows: Row<TData>[];
    table: TanStackTable<TData>;
  }) => React.ReactNode;
  /** Optional export filename (without extension). When set, shows Export. */
  exportFilename?: string;
  /** Render expanded row content. */
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  /**
   * Mobile card renderer. When provided and the viewport is below `md`,
   * the table collapses into a card list using this renderer.
   */
  renderMobileCard?: (row: Row<TData>) => React.ReactNode;
  className?: string;
  /** Accessible name for the table. */
  "aria-label"?: string;
}

export interface TableToolbarProps<TData> {
  table: TanStackTable<TData>;
  searchPlaceholder?: string;
  enableFiltering?: boolean;
  enableColumnVisibility?: boolean;
  exportFilename?: string;
  toolbarActions?: React.ReactNode;
  selectedCount: number;
  bulkActions?: React.ReactNode;
}
