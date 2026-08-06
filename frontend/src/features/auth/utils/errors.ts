import { ApiError, isApiError } from "@/lib/api";

/** Auth-domain errors for consistent UI mapping. */
export class AuthenticationError extends Error {
  readonly code = "AUTHENTICATION_ERROR";
  constructor(message = "Invalid email or password") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  constructor(message = "Please check the highlighted fields") {
    super(message);
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  readonly code = "NETWORK_ERROR";
  constructor(message = "Network request failed. Check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

export class PermissionError extends Error {
  readonly code = "PERMISSION_ERROR";
  constructor(message = "You don't have permission to perform this action") {
    super(message);
    this.name = "PermissionError";
  }
}

export function toAuthErrorMessage(error: unknown): string {
  if (
    error instanceof AuthenticationError ||
    error instanceof ValidationError ||
    error instanceof NetworkError ||
    error instanceof PermissionError
  ) {
    return error.message;
  }
  if (isApiError(error)) {
    if (error.isNetwork) return new NetworkError().message;
    if (error.isUnauthorized) return new AuthenticationError().message;
    if (error.isForbidden) return new PermissionError().message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function mapApiError(error: unknown): Error {
  if (error instanceof ApiError) {
    if (error.isNetwork) return new NetworkError();
    if (error.isUnauthorized) return new AuthenticationError(error.message);
    if (error.isForbidden) return new PermissionError(error.message);
    if (error.status === 422) return new ValidationError(error.message);
    return error;
  }
  return error instanceof Error ? error : new Error(String(error));
}
