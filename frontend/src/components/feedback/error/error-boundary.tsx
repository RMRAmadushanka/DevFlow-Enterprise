"use client";

import * as React from "react";

import { ErrorBoundaryLayout } from "@/components/layout/layouts";
import { ErrorState } from "./error-state";
import type { ErrorBoundaryProps } from "./types";

function DefaultFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <ErrorState
      variant="page"
      description={error.message || undefined}
      action={
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Try again
        </button>
      }
    />
  );
}

/**
 * Catch render errors in a subtree. Thin wrapper around the layout
 * `ErrorBoundaryLayout` with the feedback `ErrorState` as the default UI.
 */
function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryLayout fallback={fallback ?? DefaultFallback} onError={onError}>
      {children}
    </ErrorBoundaryLayout>
  );
}

export { ErrorBoundary };
