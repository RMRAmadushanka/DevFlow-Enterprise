import type * as React from "react";
import type { DisplaySize } from "@/components/data-display/shared/types";

export interface SpinnerProps {
  /** @default "md" */
  size?: DisplaySize;
  /** Accessible label for screen readers — the spinner itself is `aria-hidden`. @default "Loading" */
  label?: string;
  className?: string;
}

export interface LoadingOverlayProps {
  /** Whether the overlay is shown. Always mount the overlay; toggle this instead, so its exit animation plays. */
  visible: boolean;
  /** Optional text under the spinner (e.g. "Saving changes…"). */
  label?: React.ReactNode;
  /** Blurs the content underneath instead of just dimming it. @default true */
  blur?: boolean;
  className?: string;
}
