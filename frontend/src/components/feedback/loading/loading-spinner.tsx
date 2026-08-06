import { Spinner } from "@/components/data-display/loading";
import type { LoadingSpinnerProps } from "./types";

/** Alias of the data-display Spinner for the feedback domain. */
function LoadingSpinner({ size = "md", label = "Loading", className }: LoadingSpinnerProps) {
  return <Spinner size={size} label={label} className={className} />;
}

export { LoadingSpinner };
