"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/data-display/loading";
import type { DrawerProps } from "./types";

const sizeClassName = {
  sm: "data-[side=right]:sm:max-w-sm data-[side=left]:sm:max-w-sm",
  md: "data-[side=right]:sm:max-w-md data-[side=left]:sm:max-w-md",
  lg: "data-[side=right]:sm:max-w-lg data-[side=left]:sm:max-w-lg",
  full: "data-[side=right]:sm:max-w-full data-[side=left]:sm:max-w-full data-[side=bottom]:h-[100dvh]",
} as const;

/**
 * Side/bottom panel for details, editing, and preview. Built on Sheet —
 * focus-trapped, scroll-locking, Escape to close.
 */
function Drawer({
  open,
  onOpenChange,
  position = "right",
  title,
  description,
  children,
  footer,
  size = "md",
  loading,
  showCloseButton = true,
  className,
}: DrawerProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (loading && !next) return;
        onOpenChange?.(next);
      }}
    >
      <SheetContent
        side={position}
        showCloseButton={showCloseButton && !loading}
        className={cn(sizeClassName[size], "gap-0 p-0", className)}
      >
        {title || description ? (
          <SheetHeader className="border-b border-border">
            {title ? <SheetTitle>{title}</SheetTitle> : null}
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
        ) : null}

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {children}
          {loading ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-background/70"
              aria-busy="true"
            >
              <Spinner size="lg" label="Loading" />
            </div>
          ) : null}
        </div>

        {footer ? <SheetFooter className="border-t border-border">{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  );
}

export { Drawer };
