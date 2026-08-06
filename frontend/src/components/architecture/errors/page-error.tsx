"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/error";
import type { ArchitectureErrorProps } from "./types";

/** Full-page error surface for route `error.tsx` or template slots. */
function PageError({
  title,
  description,
  action,
  onRetry,
  className,
}: ArchitectureErrorProps) {
  return (
    <ErrorState
      variant="page"
      title={title}
      description={description}
      className={className}
      action={
        action ??
        (onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined)
      }
    />
  );
}

export { PageError };
