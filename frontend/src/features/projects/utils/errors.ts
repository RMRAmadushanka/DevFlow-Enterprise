export class ProjectNotFoundError extends Error {
  readonly code = "PROJECT_NOT_FOUND";
  constructor(message = "Project not found") {
    super(message);
    this.name = "ProjectNotFoundError";
  }
}

export class ProjectValidationError extends Error {
  readonly code = "PROJECT_VALIDATION_ERROR";
  constructor(message = "Please check the highlighted fields") {
    super(message);
    this.name = "ProjectValidationError";
  }
}

export class ProjectPermissionError extends Error {
  readonly code = "PROJECT_PERMISSION_ERROR";
  constructor(message = "You don't have permission to perform this action") {
    super(message);
    this.name = "ProjectPermissionError";
  }
}

export function toProjectErrorMessage(error: unknown): string {
  if (
    error instanceof ProjectNotFoundError ||
    error instanceof ProjectValidationError ||
    error instanceof ProjectPermissionError
  ) {
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
