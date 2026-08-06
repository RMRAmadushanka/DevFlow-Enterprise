import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A short, inline hint below a control — lighter-weight than
 * `FormDescription` (e.g. "Must be at least 8 characters" vs. a full
 * explanatory paragraph). Purely presentational, no Field context needed.
 */
function FormHint({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-hint"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export { FormHint };
