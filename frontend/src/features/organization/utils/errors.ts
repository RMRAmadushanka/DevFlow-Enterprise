import { ApiError, isApiError } from "@/lib/api";

export class OrganizationNotFoundError extends Error {
  readonly code = "ORGANIZATION_NOT_FOUND";
  constructor(message = "Organization not found") {
    super(message);
    this.name = "OrganizationNotFoundError";
  }
}

export class OrganizationValidationError extends Error {
  readonly code = "ORGANIZATION_VALIDATION_ERROR";
  constructor(message = "Please check the highlighted fields") {
    super(message);
    this.name = "OrganizationValidationError";
  }
}

export class OrganizationPermissionError extends Error {
  readonly code = "ORGANIZATION_PERMISSION_ERROR";
  constructor(message = "You don't have permission to perform this action") {
    super(message);
    this.name = "OrganizationPermissionError";
  }
}

export class InvitationError extends Error {
  readonly code = "INVITATION_ERROR";
  constructor(message = "Invitation failed") {
    super(message);
    this.name = "InvitationError";
  }
}

export class OrganizationNetworkError extends Error {
  readonly code = "ORGANIZATION_NETWORK_ERROR";
  constructor(message = "Network request failed. Check your connection.") {
    super(message);
    this.name = "OrganizationNetworkError";
  }
}

export function toOrganizationErrorMessage(error: unknown): string {
  if (
    error instanceof OrganizationNotFoundError ||
    error instanceof OrganizationValidationError ||
    error instanceof OrganizationPermissionError ||
    error instanceof InvitationError ||
    error instanceof OrganizationNetworkError
  ) {
    return error.message;
  }
  if (isApiError(error)) {
    if (error.isNetwork) return new OrganizationNetworkError().message;
    if (error.isForbidden) return new OrganizationPermissionError().message;
    if (error.status === 404) return new OrganizationNotFoundError().message;
    if (error.status === 422) return new OrganizationValidationError(error.message).message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function mapOrganizationApiError(error: unknown): Error {
  if (error instanceof ApiError) {
    if (error.isNetwork) return new OrganizationNetworkError();
    if (error.isForbidden) return new OrganizationPermissionError(error.message);
    if (error.status === 404) return new OrganizationNotFoundError(error.message);
    if (error.status === 422) return new OrganizationValidationError(error.message);
    return error;
  }
  return error instanceof Error ? error : new Error(String(error));
}
