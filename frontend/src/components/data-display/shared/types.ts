/**
 * Shared, cross-cutting types used by every component in the Enterprise
 * Data Display System. Component-specific prop interfaces live in each
 * component's own `types.ts` and extend these where relevant.
 */
import type * as React from "react";

/** Visual density — mirrors the form system's `FieldSize` for a consistent scale across both systems. */
export type DisplaySize = "sm" | "md" | "lg";

/** Compact vs. comfortable row/item spacing — used by lists, tables, and activity feeds. */
export type Density = "compact" | "comfortable";

/** Semantic tone shared by badges, status indicators, and alerts. */
export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

/** Direction of a trend/change value, as shown on `StatCard`. */
export type TrendDirection = "up" | "down" | "flat";

/** The three states almost every data-fetching display needs to render. */
export interface AsyncStateProps {
  /** Shows a skeleton/spinner in place of content. */
  loading?: boolean;
  /** Shows an `EmptyState` instead of content when there's nothing to display. */
  empty?: boolean;
  /** Shows an error `EmptyState` instead of content. */
  error?: React.ReactNode;
}

/** A single, generically-typed option — reused by filters and sort dropdowns. */
export interface DisplayOption<TValue extends string = string> {
  value: TValue;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}
