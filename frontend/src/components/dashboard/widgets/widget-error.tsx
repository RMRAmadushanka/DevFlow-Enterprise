"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/data-display/empty-state";
import type { WidgetErrorProps } from "./types";

/**
 * Inline widget error with optional retry action.
 */
function WidgetError({
  title = "Unable to load metrics",
  description = "Something went wrong while loading this widget.",
  onRetry,
  retryLabel = "Retry",
  className,
}: WidgetErrorProps) {
  return (
    <EmptyState
      variant="error"
      icon={<AlertTriangle />}
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : undefined
      }
      className={className}
    />
  );
}

export { WidgetError };
