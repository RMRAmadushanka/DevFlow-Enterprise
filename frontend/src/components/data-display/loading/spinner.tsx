import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SpinnerProps } from "./types";

const sizeClassName: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
};

/** An indeterminate spinner. Wraps its icon in `role="status"` so it reads as "Loading" without narrating every animation frame. */
function Spinner({ size = "md", label = "Loading", className }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex">
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClassName[size], className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
