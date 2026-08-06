import type * as React from "react";

export type EmptyStateVariant = "no-data" | "no-results" | "no-permission" | "error";

export interface EmptyStateProps {
  /** Selects a default icon/title/description. Any of the three can still be overridden individually. @default "no-data" */
  variant?: EmptyStateVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Overrides the variant's default icon. */
  icon?: React.ReactNode;
  /** Typically a `Button` (e.g. "+ Create Project"). */
  action?: React.ReactNode;
  className?: string;
}
