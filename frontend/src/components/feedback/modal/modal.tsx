"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/data-display/loading";
import { duration, easing } from "@/design-system/tokens/motion";
import type { OverlaySize } from "@/components/feedback/shared/types";
import type { ModalProps } from "./types";

const sizeClassName: Record<OverlaySize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
  full: "sm:max-w-[calc(100%-2rem)] sm:h-[calc(100%-2rem)] sm:max-h-[calc(100%-2rem)]",
};

/**
 * Application modal — header/content/footer composition over Base UI Dialog
 * with size variants, loading chrome, and Escape/overlay dismiss.
 * Mobile: nearly full-bleed via the shared Dialog max-width rules.
 */
function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  children,
  footer,
  loading,
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  return (
    <Dialog
      open={open}
      disablePointerDismissal={!closeOnOverlayClick || loading}
      onOpenChange={(next, details) => {
        if (loading && !next) return;
        // Block Escape while busy — Base UI surfaces the reason on eventDetails.
        if (loading && details.reason === "escape-key") return;
        onOpenChange?.(next);
      }}
    >
      <DialogContent
        showCloseButton={showCloseButton && !loading}
        className={cn(
          "max-h-[calc(100dvh-2rem)] overflow-y-auto",
          sizeClassName[size],
          size === "full" && "flex flex-col",
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: duration.fast, ease: easing.decelerate }}
          className={cn("contents", size === "full" && "flex min-h-0 flex-1 flex-col gap-4")}
        >
          {title || description ? (
            <DialogHeader>
              {title ? <DialogTitle>{title}</DialogTitle> : null}
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </DialogHeader>
          ) : null}

          <div className={cn("relative", size === "full" && "min-h-0 flex-1 overflow-y-auto")}>
            {children}
            {loading ? (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70"
                aria-busy="true"
              >
                <Spinner size="lg" label="Loading" />
              </div>
            ) : null}
          </div>

          {footer ? <DialogFooter>{footer}</DialogFooter> : null}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export { Modal, sizeClassName };
