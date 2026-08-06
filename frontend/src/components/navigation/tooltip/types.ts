import type * as React from "react";

export interface AppTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /** Delay before show in ms. @default 300 */
  delay?: number;
  disabled?: boolean;
  className?: string;
}
