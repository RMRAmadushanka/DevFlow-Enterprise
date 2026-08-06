/**
 * Transport-level API contracts used by `lib/api`.
 * Domain DTOs belong in `features/<name>/types`.
 */

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  status?: number;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
