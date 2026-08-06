import type * as React from "react";

export interface ArchitectureErrorProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}
