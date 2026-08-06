"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { duration, easing } from "@/design-system/tokens/motion";

/**
 * Validation error message, wired to `FormField`'s Base UI `Field` context
 * for correct `aria-describedby`/id association. Callers should only mount
 * this when an error is actually present (e.g. `{error && <FormErrorMessage>{error}</FormErrorMessage>}`)
 * so the subtle rise-in animation plays on each new error.
 */
function FormErrorMessage({
  className,
  children,
  match = true,
  ...props
}: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      data-slot="form-error-message"
      match={match}
      render={
        <motion.p
          layout
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: duration.instant, ease: easing.accelerate } }}
          transition={{ duration: duration.fast, ease: easing.decelerate }}
        />
      }
      className={cn("flex items-center gap-1.5 text-sm font-medium text-danger", className)}
      {...props}
    >
      <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </FieldPrimitive.Error>
  );
}

export { FormErrorMessage };
