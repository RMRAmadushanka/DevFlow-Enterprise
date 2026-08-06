"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/data-display/loading";
import { duration, easing } from "@/design-system/tokens/motion";
import type { FeedbackLoadingOverlayProps } from "./types";

/**
 * Loading overlay — `local` covers a `relative` parent; `page` covers the
 * viewport (full-page / modal busy states).
 */
function FeedbackLoadingOverlay({
  visible,
  label,
  mode = "local",
  blur = true,
  className,
}: FeedbackLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.fast, ease: easing.standard }}
          role="status"
          aria-live="polite"
          className={cn(
            "z-50 flex flex-col items-center justify-center gap-2 bg-background/70",
            mode === "page" ? "fixed inset-0" : "absolute inset-0",
            blur && "backdrop-blur-[1px]",
            className
          )}
        >
          <Spinner size="lg" label={typeof label === "string" ? label : "Loading"} />
          {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export { FeedbackLoadingOverlay };
