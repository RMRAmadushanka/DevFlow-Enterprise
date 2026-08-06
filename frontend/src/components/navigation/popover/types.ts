import type * as React from "react";

export interface AppPopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
}
