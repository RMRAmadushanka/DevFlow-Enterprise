"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { duration, easing } from "@/design-system/tokens/motion";

/**
 * Positive confirmation copy for a field (e.g. "Username is available"
 * after an async check passes). Mount conditionally, mirroring
 * `FormErrorMessage` — there's no Base UI "success" primitive, so this is a
 * plain, accessible `role="status"` region instead of `Field.Error`.
 */
type FormSuccessMessageProps = Omit<React.ComponentProps<typeof motion.p>, "children"> & {
  children?: React.ReactNode;
};

function FormSuccessMessage({ className, children, ...props }: FormSuccessMessageProps) {
  return (
    <motion.p
      data-slot="form-success-message"
      role="status"
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: duration.instant, ease: easing.accelerate } }}
      transition={{ duration: duration.fast, ease: easing.decelerate }}
      className={cn("flex items-center gap-1.5 text-sm font-medium text-success", className)}
      {...props}
    >
      <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </motion.p>
  );
}

export { FormSuccessMessage };
