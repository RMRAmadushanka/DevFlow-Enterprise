"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlobalSearchInput } from "@/components/data-display/search";
import { ColumnVisibilityMenu } from "./column-visibility-menu";
import { exportTableToCsv } from "./export-utils";
import type { TableToolbarProps } from "./types";

/**
 * Standard DataTable chrome: search, column visibility, export, optional
 * bulk actions when rows are selected, and a free-form `toolbarActions` slot.
 */
function TableToolbar<TData>({
  table,
  searchPlaceholder = "Search…",
  enableFiltering = true,
  enableColumnVisibility = true,
  exportFilename,
  toolbarActions,
  selectedCount,
  bulkActions,
}: TableToolbarProps<TData>) {
  return (
    <div data-slot="table-toolbar" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {enableFiltering ? (
          <GlobalSearchInput
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(value) => table.setGlobalFilter(value)}
            placeholder={searchPlaceholder}
            shortcut={null}
            className="min-w-[12rem] flex-1 sm:max-w-xs"
            label={searchPlaceholder}
          />
        ) : null}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {toolbarActions}
          {enableColumnVisibility ? <ColumnVisibilityMenu table={table} /> : null}
          {exportFilename ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => exportTableToCsv(table, exportFilename)}
            >
              <Download className="size-3.5" />
              Export
            </Button>
          ) : null}
        </div>
      </div>

      {selectedCount > 0 && bulkActions ? (
        <div
          role="region"
          aria-label={`${selectedCount} selected`}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
        >
          <span className="font-medium text-foreground">{selectedCount} selected</span>
          <div className="flex flex-wrap items-center gap-2">{bulkActions}</div>
        </div>
      ) : null}
    </div>
  );
}

export { TableToolbar };
