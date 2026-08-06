"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/error";
import type { ArchitectureErrorProps } from "./types";

/** Scoped feature/section error — keeps the rest of the page usable. */
function FeatureError({
  title = "This section failed to load",
  description,
  action,
  onRetry,
  className,
}: ArchitectureErrorProps) {
  return (
    <ErrorState
      variant="component"
      title={title}
      description={description}
      className={className}
      action={
        action ??
        (onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined)
      }
    />
  );
}

export { FeatureError };
