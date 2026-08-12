import type { ApiErrorBody } from "@/types/api";
import type { ApiErrorDetail } from "./types/envelope";

/**
 * Typed API failure — thrown by the service layer, mapped in hooks/UI.
 * Aligns with DevFlow `ApiResponse.error` (+ HTTP status).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: Record<string, unknown> | ApiErrorDetail[];
  readonly correlationId?: string;
  readonly timestamp?: string;
  readonly path?: string;

  constructor(body: ApiErrorBody & { correlationId?: string; timestamp?: string; path?: string }) {
    super(body.message);
    this.name = "ApiError";
    this.status = body.status ?? 500;
    this.code = body.code;
    this.details = body.details;
    this.correlationId = body.correlationId;
    this.timestamp = body.timestamp;
    this.path = body.path;
  }

  get isNetwork() {
    return this.status === 0 || this.code === "NETWORK_ERROR";
  }

  get isTimeout() {
    return this.code === "TIMEOUT" || this.status === 408;
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

  get isServerError() {
    return this.status >= 500;
  }
}

/** 403 — authorization failure; never treated as logout trigger. */
export class AuthorizationError extends ApiError {
  constructor(body: ConstructorParameters<typeof ApiError>[0]) {
    super({ ...body, status: body.status ?? 403, code: body.code ?? "FORBIDDEN" });
    this.name = "AuthorizationError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError || (isApiError(error) && error.isForbidden);
}
