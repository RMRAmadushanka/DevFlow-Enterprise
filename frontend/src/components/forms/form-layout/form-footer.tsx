import * as React from "react";

import { cn } from "@/lib/utils";

interface FormFooterProps extends React.ComponentProps<"div"> {
  /** Pins the footer to the bottom of the viewport with a top border/backdrop. */
  sticky?: boolean;
}

/** Bottom bar of a form — typically wraps `FormActions` plus optional status/helper copy. */
function FormFooter({ className, sticky, ...props }: FormFooterProps) {
  return (
    <div
      data-slot="form-footer"
      className={cn(
        "flex flex-col-reverse items-center gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between",
        sticky && "sticky bottom-0 z-10 bg-background/95 supports-backdrop-filter:backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

export { FormFooter };
