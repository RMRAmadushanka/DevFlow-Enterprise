export class TaskNotFoundError extends Error {
  constructor(message = "Task not found") {
    super(message);
    this.name = "TaskNotFoundError";
  }
}

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskValidationError";
  }
}

export class TaskPermissionError extends Error {
  constructor(message = "You do not have permission for this action") {
    super(message);
    this.name = "TaskPermissionError";
  }
}

export function toTaskErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
