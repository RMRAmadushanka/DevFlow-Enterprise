import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The "*" shown next to a required field's label. Visually an asterisk,
 * but screen readers get the word "required" instead of a bare glyph.
 */
function FormRequiredIndicator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="form-required-indicator"
      className={cn("ml-0.5 text-danger", className)}
      {...props}
    >
      <span aria-hidden="true">*</span>
      <span className="sr-only">(required)</span>
    </span>
  );
}

export { FormRequiredIndicator };
