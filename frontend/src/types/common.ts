/** Shared cross-feature contracts — keep domain types inside features. */

export type Id = string;

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: string;
  direction: SortDirection;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListQueryParams extends PaginationParams {
  search?: string;
  sort?: SortState;
  filters?: Record<string, string | string[] | null | undefined>;
}
