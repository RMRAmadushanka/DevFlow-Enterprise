"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/data-display/empty-state";
import { SkeletonTable } from "@/components/data-display/skeleton";
import type { EnterpriseDataGridProps } from "./types";

function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    size: 40,
    enableSorting: false,
    enableResizing: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllRowsSelected(!!checked)}
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

/**
 * Virtualized enterprise grid for 10k+ rows — fixed/sticky leading columns,
 * column resize, keyboard row focus, and optional inline actions.
 */
function EnterpriseDataGrid<TData>({
  columns,
  data,
  getRowId,
  estimateSize = 44,
  height = 480,
  stickyColumnCount = 0,
  enableSorting = true,
  enableRowSelection = false,
  enableColumnResizing = true,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  loading,
  empty,
  renderRowActions,
  className,
  "aria-label": ariaLabel = "Data grid",
}: EnterpriseDataGridProps<TData>) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const resolvedColumns = React.useMemo(() => {
    const cols: ColumnDef<TData, unknown>[] = [];
    if (enableRowSelection) cols.push(createSelectionColumn());
    cols.push(...columns);
    if (renderRowActions) {
      cols.push({
        id: "actions",
        size: 96,
        enableSorting: false,
        enableResizing: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => renderRowActions(row),
      });
    }
    return cols;
  }, [columns, enableRowSelection, renderRowActions]);

  const controlledState = {
    ...(sorting !== undefined ? { sorting } : {}),
    ...(rowSelection !== undefined ? { rowSelection } : {}),
  };

  const table = useReactTable({
    data,
    columns: resolvedColumns,
    getRowId,
    state: controlledState,
    enableSorting,
    enableColumnResizing,
    columnResizeMode: "onChange",
    onSortingChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
  });

  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 10,
  });

  const stickyIds = React.useMemo(() => {
    const leaf = table.getVisibleLeafColumns();
    return new Set(leaf.slice(0, stickyColumnCount).map((column) => column.id));
    // `resolvedColumns` identity captures selection/actions column changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- table instance is stable enough for leaf ids
  }, [stickyColumnCount, resolvedColumns]);

  function stickyOffset(columnId: string): number | undefined {
    if (!stickyIds.has(columnId)) return undefined;
    const leaf = table.getVisibleLeafColumns();
    let offset = 0;
    for (const column of leaf) {
      if (column.id === columnId) return offset;
      if (stickyIds.has(column.id)) offset += column.getSize();
    }
    return undefined;
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (rows.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((index) => Math.min(index + 1, rows.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setFocusedIndex(rows.length - 1);
    } else if (event.key === " " && enableRowSelection) {
      event.preventDefault();
      rows[focusedIndex]?.toggleSelected();
    }
  }

  React.useEffect(() => {
    virtualizer.scrollToIndex(focusedIndex, { align: "auto" });
  }, [focusedIndex, virtualizer]);

  if (loading) {
    return <SkeletonTable rows={8} columns={Math.min(resolvedColumns.length, 6)} className={className} />;
  }

  if (rows.length === 0) {
    return empty ?? <EmptyState variant="no-data" className={cn("rounded-lg border border-border", className)} />;
  }

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom = totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0);

  return (
    <div
      ref={parentRef}
      data-slot="enterprise-data-grid"
      role="grid"
      aria-label={ariaLabel}
      aria-rowcount={rows.length}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative overflow-auto rounded-lg border border-border outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      style={{ height }}
    >
      <table className="w-full caption-bottom table-fixed text-sm" style={{ width: table.getCenterTotalSize() }}>
        <thead className="sticky top-0 z-20 bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const left = stickyOffset(header.column.id);
                const isSticky = left !== undefined;
                return (
                  <th
                    key={header.id}
                    role="columnheader"
                    aria-sort={
                      sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : canSort ? "none" : undefined
                    }
                    style={{ width: header.getSize(), left }}
                    className={cn(
                      "relative h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground",
                      isSticky && "sticky z-30 bg-background",
                      canSort && "cursor-pointer select-none"
                    )}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort ? (
                        sorted === "asc" ? (
                          <ArrowUp className="size-3.5" aria-hidden="true" />
                        ) : sorted === "desc" ? (
                          <ArrowDown className="size-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />
                        )
                      ) : null}
                    </div>
                    {enableColumnResizing && header.column.getCanResize() ? (
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          "absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none hover:bg-border",
                          header.column.getIsResizing() && "bg-primary"
                        )}
                      />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 ? (
            <tr aria-hidden="true">
              <td style={{ height: paddingTop }} colSpan={resolvedColumns.length} />
            </tr>
          ) : null}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const focused = virtualRow.index === focusedIndex;
            return (
              <tr
                key={row.id}
                role="row"
                aria-rowindex={virtualRow.index + 1}
                aria-selected={row.getIsSelected() || undefined}
                data-focused={focused || undefined}
                className={cn(
                  "border-b transition-colors hover:bg-muted/50 data-[focused=true]:bg-muted/70 data-[focused=true]:outline data-[focused=true]:outline-1 data-[focused=true]:outline-ring/40",
                  row.getIsSelected() && "bg-muted"
                )}
                onClick={() => setFocusedIndex(virtualRow.index)}
              >
                {row.getVisibleCells().map((cell) => {
                  const left = stickyOffset(cell.column.id);
                  const isSticky = left !== undefined;
                  return (
                    <td
                      key={cell.id}
                      role="gridcell"
                      style={{ width: cell.column.getSize(), left, height: estimateSize }}
                      className={cn(
                        "px-2 align-middle whitespace-nowrap",
                        isSticky && "sticky z-10 bg-background"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {paddingBottom > 0 ? (
            <tr aria-hidden="true">
              <td style={{ height: paddingBottom }} colSpan={resolvedColumns.length} />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export { EnterpriseDataGrid };
