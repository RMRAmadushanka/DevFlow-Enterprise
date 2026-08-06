"use client";

import * as React from "react";

import type { PaginationParams } from "@/types/common";

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  /** Controlled page (URL state). */
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Local or controlled pagination state for list pages.
 * Pair with `useUrlState` when page/pageSize live in the query string.
 */
export function usePagination({
  initialPage = 1,
  initialPageSize = 20,
  page: controlledPage,
  pageSize: controlledPageSize,
  onPageChange,
  onPageSizeChange,
}: UsePaginationOptions = {}) {
  const [uncontrolledPage, setUncontrolledPage] = React.useState(initialPage);
  const [uncontrolledSize, setUncontrolledSize] = React.useState(initialPageSize);

  const page = controlledPage ?? uncontrolledPage;
  const pageSize = controlledPageSize ?? uncontrolledSize;

  const setPage = React.useCallback(
    (next: number) => {
      if (controlledPage === undefined) setUncontrolledPage(next);
      onPageChange?.(next);
    },
    [controlledPage, onPageChange]
  );

  const setPageSize = React.useCallback(
    (next: number) => {
      if (controlledPageSize === undefined) setUncontrolledSize(next);
      onPageSizeChange?.(next);
      setPage(1);
    },
    [controlledPageSize, onPageSizeChange, setPage]
  );

  const params: PaginationParams = { page, pageSize };

  return {
    page,
    pageSize,
    params,
    setPage,
    setPageSize,
    nextPage: () => setPage(page + 1),
    prevPage: () => setPage(Math.max(1, page - 1)),
    reset: () => {
      setPage(initialPage);
      setPageSize(initialPageSize);
    },
  };
}
