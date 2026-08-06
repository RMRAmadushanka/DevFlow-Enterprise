import type * as React from "react";
import type { OverlayOpenProps, OverlaySize } from "@/components/feedback/shared/types";

export type DrawerPosition = "left" | "right" | "bottom";

export interface DrawerProps extends OverlayOpenProps {
  position?: DrawerPosition;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Maps to sheet width/height. `full` stretches edge-to-edge on mobile. @default "md" */
  size?: Exclude<OverlaySize, "xl">;
  showCloseButton?: boolean;
  className?: string;
}

export interface DetailDrawerProps extends DrawerProps {
  /** Secondary content slot (e.g. activity feed). */
  activity?: React.ReactNode;
  /** Header actions (edit, more menu). */
  actions?: React.ReactNode;
}

export type FilterDrawerProps = DrawerProps;

export interface PreviewDrawerProps extends DrawerProps {
  /** Optional media/preview surface rendered above the body. */
  preview?: React.ReactNode;
}
