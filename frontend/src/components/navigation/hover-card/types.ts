import type * as React from "react";

export interface AppHoverCardProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
}

export interface PreviewHoverCardProps {
  trigger: React.ReactElement;
  avatar?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}
