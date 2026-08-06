import * as React from "react";

import { cn } from "@/lib/utils";

/** Small keyboard-shortcut hint chip, e.g. shown inside `SearchInput`. */
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border bg-muted px-1 font-mono text-[0.7rem] font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Kbd };
