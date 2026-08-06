import type * as React from "react";
import type { DisplaySize, Tone } from "@/components/data-display/shared/types";

export interface StatusBadgeProps {
  /** Semantic tone — drives color. @default "neutral" */
  tone?: Tone;
  /** Badge text. */
  children: React.ReactNode;
  /** Leading icon, rendered instead of the dot when both are supplied. */
  icon?: React.ReactNode;
  /** Renders a small solid dot before the label instead of/alongside an icon. */
  dot?: boolean;
  /** @default "md" */
  size?: DisplaySize;
  className?: string;
}
