export class DocumentNotFoundError extends Error {
  constructor(message = "Document not found") {
    super(message);
    this.name = "DocumentNotFoundError";
  }
}

export class DocumentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentValidationError";
  }
}

export function toDocumentErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
