"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { duration, easing } from "@/design-system/tokens/motion";
import type { SuccessStateProps } from "./types";

/**
 * Inline success confirmation for completed flows (not a modal).
 * For modal success, use `SuccessModal`.
 */
function SuccessState({
  title = "All done",
  description,
  action,
  className,
}: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.moderate, ease: easing.decelerate }}
      role="status"
      className={cn("flex flex-col items-center gap-3 px-6 py-10 text-center", className)}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </motion.div>
  );
}

export { SuccessState };
