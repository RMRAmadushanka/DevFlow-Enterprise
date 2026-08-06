import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const formContainerVariants = cva("flex w-full flex-col", {
  variants: {
    size: {
      sm: "max-w-md",
      md: "max-w-xl",
      lg: "max-w-3xl",
      full: "max-w-none",
    },
    spacing: {
      compact: "gap-4",
      default: "gap-6",
      relaxed: "gap-8",
    },
  },
  defaultVariants: {
    size: "full",
    spacing: "default",
  },
});

/**
 * The outermost visual wrapper for a form's content — centers/constrains
 * width and sets the vertical rhythm between sections. Purely layout: pair
 * it with `AppForm` (which owns the actual `<form>` element + submit
 * behavior) or use it standalone inside any `<form>`.
 */
function FormContainer({
  className,
  size,
  spacing,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof formContainerVariants>) {
  return (
    <div
      data-slot="form-container"
      className={cn(formContainerVariants({ size, spacing }), className)}
      {...props}
    />
  );
}

export { FormContainer, formContainerVariants };
