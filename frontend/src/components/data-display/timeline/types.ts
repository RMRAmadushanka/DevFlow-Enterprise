import type * as React from "react";
import type { Tone } from "@/components/data-display/shared/types";

export type TimelineOrientation = "vertical" | "horizontal";

export interface TimelineItemData {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  timestamp?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  active?: boolean;
}

export interface TimelineProps {
  items: TimelineItemData[];
  orientation?: TimelineOrientation;
  className?: string;
  /** Accessible name. @default "Timeline" */
  label?: string;
}
