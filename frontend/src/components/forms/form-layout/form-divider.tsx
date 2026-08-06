import * as React from "react";

import { cn } from "@/lib/utils";

interface FormDividerProps extends React.ComponentProps<"div"> {
  /** Optional centered label, e.g. "OR". */
  label?: React.ReactNode;
}

/** Horizontal rule separating form sections, with an optional centered label. */
function FormDivider({ className, label, ...props }: FormDividerProps) {
  if (!label) {
    return (
      <div
        data-slot="form-divider"
        role="separator"
        className={cn("h-px w-full bg-border", className)}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="form-divider"
      role="separator"
      className={cn("flex items-center gap-3", className)}
      {...props}
    >
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export { FormDivider };
