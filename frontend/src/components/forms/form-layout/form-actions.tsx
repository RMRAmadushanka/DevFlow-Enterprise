import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const formActionsVariants = cva("flex w-full flex-col-reverse gap-2 sm:flex-row", {
  variants: {
    align: {
      start: "sm:justify-start",
      end: "sm:justify-end",
      between: "sm:justify-between",
      center: "sm:justify-center",
    },
  },
  defaultVariants: {
    align: "end",
  },
});

/**
 * Generic layout row for a group of action buttons (Submit/Cancel/Reset).
 * For the actual semantic buttons with form-state wiring (loading/disabled
 * on submit, confirm-before-reset, …) see `components/forms/form-actions`.
 */
function FormActions({
  className,
  align,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof formActionsVariants>) {
  return (
    <div
      data-slot="form-actions"
      className={cn(formActionsVariants({ align }), className)}
      {...props}
    />
  );
}

export { FormActions, formActionsVariants };
