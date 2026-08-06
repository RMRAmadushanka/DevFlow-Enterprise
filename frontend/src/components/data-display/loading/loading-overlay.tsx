"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { duration, easing } from "@/design-system/tokens/motion";
import { Spinner } from "./spinner";
import type { LoadingOverlayProps } from "./types";

/**
 * A dimmed overlay for an in-progress async operation over existing content
 * (a table refetch, a card save) — as opposed to `Skeleton`, which replaces
 * content that hasn't loaded yet at all. Mount inside a `relative` container.
 */
function LoadingOverlay({ visible, label, blur = true, className }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.fast, ease: easing.standard }}
          className={cn(
            "absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/70",
            blur && "backdrop-blur-[1px]",
            className
          )}
          role="status"
          aria-live="polite"
        >
          <Spinner size="lg" label={typeof label === "string" ? label : "Loading"} />
          {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export { LoadingOverlay };
