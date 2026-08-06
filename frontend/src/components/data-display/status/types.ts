import type * as React from "react";
import type { DisplaySize, Tone } from "@/components/data-display/shared/types";

export interface StatusIndicatorProps {
  /** Semantic tone — drives the dot/icon color. @default "neutral" */
  tone?: Tone;
  /** The status text, e.g. "Online", "Deployment successful". */
  label: React.ReactNode;
  /** Replaces the dot with a custom icon (e.g. a spinner for "in progress"). */
  icon?: React.ReactNode;
  /** Adds a subtle pulsing ring around the dot — reserve for genuinely "live" states (e.g. online presence). */
  pulse?: boolean;
  /** @default "md" */
  size?: DisplaySize;
  className?: string;
}
