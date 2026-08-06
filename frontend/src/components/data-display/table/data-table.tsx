"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/data-display/empty-state";
import { Pagination } from "@/components/data-display/pagination";
import { SkeletonTable } from "@/components/data-display/skeleton";
import { useIsMobile } from "@/components/data-display/shared/hooks";
import { duration, easing } from "@/design-system/tokens/motion";
import { TableToolbar } from "./table-toolbar";
import type { DataTableProps } from "./types";

function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    size: 40,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
      />
    ),
  };
}

function createExpanderColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "expander",
    size: 40,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    header: () => null,
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          aria-expanded={row.getIsExpanded()}
          onClick={() => row.toggleExpanded()}
        >
          {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
        </Button>
      ) : null,
  };
}

/**
 * Enterprise DataTable built on TanStack Table — sorting, filtering,
 * pagination, selection, column visibility/resize, expansion, sticky
 * header, CSV export, loading/empty states, and optional mobile cards.
 */
function DataTable<TData>({
  columns,
  data,
  getRowId,
  enableSorting = true,
  enableFiltering = true,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  enableColumnVisibility = true,
  enableColumnResizing = false,
  enableExpanding = false,
  enablePagination = true,
  stickyHeader = true,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  rowSelection,
  onRowSelectionChange,
  columnVisibility,
  onColumnVisibilityChange,
  columnSizing,
  onColumnSizingChange,
  expanded,
  onExpandedChange,
  pagination,
  onPaginationChange,
  manualSorting,
  manualFiltering,
  manualPagination,
  pageCount,
  rowCount,
  density = "comfortable",
  loading,
  empty,
  searchPlaceholder,
  pageSizeOptions,
  noun,
  toolbarActions,
  bulkActions,
  exportFilename,
  renderExpandedRow,
  renderMobileCard,
  className,
  "aria-label": ariaLabel = "Data table",
}: DataTableProps<TData>) {
  const isMobile = useIsMobile();

  const resolvedColumns = React.useMemo(() => {
    const cols: ColumnDef<TData, unknown>[] = [];
    if (enableRowSelection) cols.push(createSelectionColumn());
    if (enableExpanding) cols.push(createExpanderColumn());
    cols.push(...columns);
    return cols;
  }, [columns, enableRowSelection, enableExpanding]);

  // Only pass state keys the caller actually controls — TanStack treats an
  // explicit `undefined` (e.g. `rowSelection: undefined`) as a broken value.
  const controlledState = {
    ...(sorting !== undefined ? { sorting } : {}),
    ...(columnFilters !== undefined ? { columnFilters } : {}),
    ...(globalFilter !== undefined ? { globalFilter } : {}),
    ...(rowSelection !== undefined ? { rowSelection } : {}),
    ...(columnVisibility !== undefined ? { columnVisibility } : {}),
    ...(columnSizing !== undefined ? { columnSizing } : {}),
    ...(expanded !== undefined ? { expanded } : {}),
    ...(pagination !== undefined ? { pagination } : {}),
  };

  const table = useReactTable({
    data,
    columns: resolvedColumns,
    getRowId,
    state: controlledState,
    enableSorting,
    enableMultiRowSelection,
    enableColumnResizing,
    columnResizeMode: "onChange",
    manualSorting,
    manualFiltering,
    manualPagination,
    pageCount,
    rowCount,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onRowSelectionChange,
    onColumnVisibilityChange,
    onColumnSizingChange,
    onExpandedChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting && !manualSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering && !manualFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination && !manualPagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
    getRowCanExpand: enableExpanding ? () => true : undefined,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const total =
    rowCount ??
    (manualPagination
      ? (pageCount ?? 1) * table.getState().pagination.pageSize
      : table.getFilteredRowModel().rows.length);

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-3", className)} aria-busy="true" aria-label={ariaLabel}>
        <SkeletonTable rows={5} columns={Math.min(resolvedColumns.length, 6)} />
      </div>
    );
  }

  const rows = table.getRowModel().rows;
  const showMobileCards = isMobile && !!renderMobileCard;

  return (
    <div data-slot="data-table" className={cn("flex flex-col gap-3", className)}>
      <TableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        enableFiltering={enableFiltering}
        enableColumnVisibility={enableColumnVisibility}
        exportFilename={exportFilename}
        toolbarActions={toolbarActions}
        selectedCount={selectedRows.length}
        bulkActions={
          bulkActions
            ? bulkActions({ selectedRows, table })
            : undefined
        }
      />

      {rows.length === 0 ? (
        empty ?? <EmptyState variant="no-results" className="rounded-lg border border-border" />
      ) : showMobileCards ? (
        <ul aria-label={ariaLabel} className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.id}>{renderMobileCard(row)}</li>
          ))}
        </ul>
      ) : (
        <div
          data-slot="table-container"
          className={cn(
            "relative w-full overflow-auto rounded-lg border border-border",
            stickyHeader && "max-h-[min(70vh,40rem)]"
          )}
        >
          {/* Own scrollport (not the ui/Table wrapper) so sticky headers work. */}
          <table
            data-slot="table"
            aria-label={ariaLabel}
            className={cn("w-full caption-bottom text-sm", enableColumnResizing && "table-fixed")}
            style={
              enableColumnResizing
                ? { width: table.getCenterTotalSize() }
                : undefined
            }
          >
            <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-background")}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        style={
                          enableColumnResizing
                            ? { width: header.getSize() }
                            : undefined
                        }
                        className={cn(
                          "relative",
                          density === "compact" && "h-8",
                          canSort && "cursor-pointer select-none"
                        )}
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : canSort
                                ? "none"
                                : undefined
                        }
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        onKeyDown={
                          canSort
                            ? (event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  header.column.getToggleSortingHandler()?.(event);
                                }
                              }
                            : undefined
                        }
                        tabIndex={canSort ? 0 : undefined}
                      >
                        <div className="flex items-center gap-1.5">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort ? (
                            sorted === "asc" ? (
                              <ArrowUp className="size-3.5 shrink-0" aria-hidden="true" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="size-3.5 shrink-0" aria-hidden="true" />
                            ) : (
                              <ArrowUpDown className="size-3.5 shrink-0 opacity-40" aria-hidden="true" />
                            )
                          ) : null}
                        </div>
                        {enableColumnResizing && header.column.getCanResize() ? (
                          <div
                            role="separator"
                            aria-orientation="vertical"
                            aria-label={`Resize ${header.column.id} column`}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              "absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none bg-transparent hover:bg-border",
                              header.column.getIsResizing() && "bg-primary"
                            )}
                          />
                        ) : null}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <motion.tr
                    data-slot="table-row"
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: duration.fast,
                      ease: easing.decelerate,
                      delay: Math.min(index, 8) * 0.015,
                    }}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                      density === "compact" && "[&>td]:py-1.5"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={
                          enableColumnResizing
                            ? { width: cell.column.getSize() }
                            : undefined
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </motion.tr>
                  {row.getIsExpanded() && renderExpandedRow ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={row.getVisibleCells().length} className="bg-muted/30 p-4">
                        {renderExpandedRow(row as Row<TData>)}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </React.Fragment>
              ))}
            </TableBody>
          </table>
        </div>
      )}

      {enablePagination && rows.length > 0 ? (
        <Pagination
          page={table.getState().pagination.pageIndex + 1}
          pageSize={table.getState().pagination.pageSize}
          total={total}
          pageSizeOptions={pageSizeOptions}
          noun={noun}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      ) : null}
    </div>
  );
}

export { DataTable };
