export class MonitoringNotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "MonitoringNotFoundError";
  }
}

export class MonitoringValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MonitoringValidationError";
  }
}

export function toMonitoringErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
