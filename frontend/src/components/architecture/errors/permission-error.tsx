"use client";

import * as React from "react";

import { ErrorState } from "@/components/feedback/error";
import type { ArchitectureErrorProps } from "./types";

function PermissionError({
  title,
  description,
  action,
  className,
}: ArchitectureErrorProps) {
  return (
    <ErrorState
      variant="permission"
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}

export { PermissionError };
