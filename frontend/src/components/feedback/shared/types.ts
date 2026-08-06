import type * as React from "react";

/** Semantic tone shared across alerts, toasts, confirmations, and status messages. */
export type FeedbackTone = "success" | "error" | "warning" | "info" | "neutral";

/** Overlay surface sizes used by Modal / Drawer. */
export type OverlaySize = "sm" | "md" | "lg" | "xl" | "full";

/** Shared open-state contract for every overlay. */
export interface OverlayOpenProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, the primary action is busy and dismiss is typically blocked. */
  loading?: boolean;
}

export interface FeedbackAction {
  label: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  disabled?: boolean;
}
