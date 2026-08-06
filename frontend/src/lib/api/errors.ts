import type { ApiErrorBody } from "@/types/api";

/**
 * Typed API failure — thrown by the service layer, mapped in hooks/UI.
 * Never construct this from React components; only from `lib/api` / services.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: Record<string, unknown>;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = body.status ?? 500;
    this.code = body.code;
    this.details = body.details;
  }

  get isNetwork() {
    return this.status === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
