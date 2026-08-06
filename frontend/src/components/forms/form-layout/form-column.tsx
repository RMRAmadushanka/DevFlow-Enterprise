import * as React from "react";

import { cn } from "@/lib/utils";

/** A single vertical stack of fields — the building block inside `FormRow`/`FormGrid`. */
function FormColumn({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-column"
      className={cn("flex min-w-0 flex-1 flex-col gap-4", className)}
      {...props}
    />
  );
}

export { FormColumn };
