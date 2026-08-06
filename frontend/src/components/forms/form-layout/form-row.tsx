import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Lays out fields side by side on `sm:`+ viewports, stacking vertically on
 * mobile — the standard "First name / Last name" pattern.
 */
function FormRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-row"
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start [&>*]:min-w-0 [&>*]:flex-1",
        className
      )}
      {...props}
    />
  );
}

export { FormRow };
