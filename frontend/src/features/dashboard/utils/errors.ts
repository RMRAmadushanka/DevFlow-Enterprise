export class DashboardNetworkError extends Error {
  readonly code = "DASHBOARD_NETWORK_ERROR";
  constructor(message = "Unable to load dashboard data. Check your connection.") {
    super(message);
    this.name = "DashboardNetworkError";
  }
}

export class DashboardPermissionError extends Error {
  readonly code = "DASHBOARD_PERMISSION_ERROR";
  constructor(message = "You don't have permission to view this dashboard.") {
    super(message);
    this.name = "DashboardPermissionError";
  }
}

export function toDashboardErrorMessage(error: unknown): string {
  if (error instanceof DashboardNetworkError || error instanceof DashboardPermissionError) {
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong loading the dashboard.";
}
