"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatRangeSummary } from "@/components/data-display/shared/formatters";
import { getPageRange, ELLIPSIS } from "./utils";
import type { PaginationProps } from "./types";

/**
 * Full table/list pagination — range summary, page-size selector, and a
 * collapsing page-number sequence with previous/next controls. Fully
 * controlled: the caller owns `page`/`pageSize` and slices its own data.
 */
function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  siblingCount = 1,
  noun,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);
  const pages = getPageRange(currentPage, totalPages, siblingCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
    >
      <p className="text-sm text-muted-foreground">{formatRangeSummary(from, to, total, noun)}</p>

      <div className="flex flex-wrap items-center gap-4">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger size="sm" className="w-[4.5rem]" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>

          {pages.map((entry, index) =>
            entry === ELLIPSIS ? (
              <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-muted-foreground" aria-hidden="true">
                …
              </span>
            ) : (
              <Button
                key={entry}
                variant={entry === currentPage ? "default" : "ghost"}
                size="icon-sm"
                aria-label={`Page ${entry}`}
                aria-current={entry === currentPage ? "page" : undefined}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </nav>
  );
}

export { Pagination };
