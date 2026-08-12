/**
 * Transport-level API contracts used by `lib/api`.
 * Domain DTOs for Gateway live under `lib/api/types`; UI domain types stay in features.
 */

import type { ApiErrorDetail } from "@/lib/api/types/envelope";

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: Record<string, unknown> | ApiErrorDetail[];
  status?: number;
  correlationId?: string;
  timestamp?: string;
  path?: string;
}

/** Unwrapped success payload shape (legacy alias). Prefer ApiEnvelope in lib/api/types. */
export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
  success?: boolean;
  error?: null;
  correlationId?: string;
  timestamp?: string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
