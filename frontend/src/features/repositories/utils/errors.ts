export class RepositoryNotFoundError extends Error {
  constructor(message = "Repository not found") {
    super(message);
    this.name = "RepositoryNotFoundError";
  }
}

export class RepositoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryValidationError";
  }
}

export function toRepositoryErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
