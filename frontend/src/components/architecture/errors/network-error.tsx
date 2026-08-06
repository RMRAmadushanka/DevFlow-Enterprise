"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/error";
import type { ArchitectureErrorProps } from "./types";

function NetworkError({
  title,
  description,
  action,
  onRetry,
  className,
}: ArchitectureErrorProps) {
  return (
    <ErrorState
      variant="network"
      title={title}
      description={description}
      className={className}
      action={
        action ??
        (onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined)
      }
    />
  );
}

export { NetworkError };
