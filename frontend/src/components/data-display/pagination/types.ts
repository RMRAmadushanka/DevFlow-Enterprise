export interface PaginationProps {
  /** Current page, 1-indexed. */
  page: number;
  pageSize: number;
  /** Total number of records across all pages. */
  total: number;
  onPageChange: (page: number) => void;
  /** Omit to hide the page-size selector entirely. */
  onPageSizeChange?: (pageSize: number) => void;
  /** @default [10, 20, 50, 100] */
  pageSizeOptions?: number[];
  /** How many page numbers to show on either side of the current page. @default 1 */
  siblingCount?: number;
  /** Noun appended to the "Showing x-y of z" summary, e.g. `"projects"`. */
  noun?: string;
  className?: string;
}
