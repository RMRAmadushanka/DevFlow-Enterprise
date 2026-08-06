import type * as React from "react";

export type ErrorStateVariant = "page" | "component" | "network" | "permission";

export interface ErrorStateProps {
  variant?: ErrorStateVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; onRetry: () => void }>;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}
