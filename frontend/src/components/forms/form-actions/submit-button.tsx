import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SubmitButtonProps extends Omit<React.ComponentProps<typeof Button>, "type"> {
  /** Shows a spinner and disables the button — pass `form.isSubmitting` from `useAppForm`. */
  loading?: boolean;
  loadingText?: React.ReactNode;
}

/** The primary submit action for a form. Always `type="submit"` so it works with native `<form>` submission (Enter key included). */
function SubmitButton({
  loading = false,
  loadingText,
  disabled,
  children,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn("min-w-24", className)}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {loading ? (loadingText ?? children) : children}
    </Button>
  );
}

export { SubmitButton };
