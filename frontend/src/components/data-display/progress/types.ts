import type * as React from "react";
import type { DisplaySize, Tone } from "@/components/data-display/shared/types";

export interface ProgressBarProps {
  /** Current value, 0–100. */
  value: number;
  /** Label rendered above the track (e.g. "Sprint progress"). */
  label?: React.ReactNode;
  /** Shows the numeric percentage next to the label. @default true */
  showValue?: boolean;
  /** @default "info" */
  tone?: Tone;
  /** @default "md" */
  size?: DisplaySize;
  /** Animates the fill in from 0 on mount, rather than snapping to `value`. @default true */
  animated?: boolean;
  className?: string;
}

export interface CircularProgressProps {
  /** Current value, 0–100. */
  value: number;
  /** Diameter in pixels. @default 64 */
  size?: number;
  /** Ring thickness in pixels. @default 6 */
  strokeWidth?: number;
  /** @default "info" */
  tone?: Tone;
  /** Shows the numeric percentage in the center. @default true */
  showValue?: boolean;
  /** Accessible label — falls back to `"{value}%"` when omitted. */
  label?: string;
  /** Animates the ring in from 0 on mount. @default true */
  animated?: boolean;
  className?: string;
}
