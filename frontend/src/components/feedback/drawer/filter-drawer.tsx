"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Drawer } from "./drawer";
import type { FilterDrawerProps } from "./types";

export interface FilterDrawerActionsProps extends FilterDrawerProps {
  onApply?: () => void;
  onReset?: () => void;
  applyLabel?: React.ReactNode;
  resetLabel?: React.ReactNode;
}

/**
 * Drawer chrome for advanced filter UIs — Apply / Reset footer by default.
 */
function FilterDrawer({
  title = "Filters",
  onApply,
  onReset,
  applyLabel = "Apply filters",
  resetLabel = "Reset",
  onOpenChange,
  footer,
  ...props
}: FilterDrawerActionsProps) {
  return (
    <Drawer
      {...props}
      title={title}
      position={props.position ?? "right"}
      onOpenChange={onOpenChange}
      footer={
        footer ?? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onReset?.();
              }}
            >
              {resetLabel}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onApply?.();
                onOpenChange?.(false);
              }}
            >
              {applyLabel}
            </Button>
          </>
        )
      }
    />
  );
}

export { FilterDrawer };
