/**
 * DevFlow common-library ApiResponse / PageResponse shapes.
 * @see backend/common-library
 */

export interface ApiErrorDetail {
  field?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail[] | Record<string, unknown> | null;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorPayload | null;
  correlationId?: string | null;
  timestamp?: string | null;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
}
