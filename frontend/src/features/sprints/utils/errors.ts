export class SprintNotFoundError extends Error {
  constructor(message = "Sprint not found") {
    super(message);
    this.name = "SprintNotFoundError";
  }
}

export class SprintValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SprintValidationError";
  }
}

export function toSprintErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
