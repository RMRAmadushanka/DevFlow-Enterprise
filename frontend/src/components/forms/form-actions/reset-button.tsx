import * as React from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ResetButtonProps extends Omit<React.ComponentProps<typeof Button>, "type" | "onClick"> {
  onReset: () => void;
  /** Confirmation copy shown via a native `confirm()` before resetting — omit to reset immediately. */
  confirmMessage?: string;
}

/** Clears a form back to its default values. `type="button"` — call `form.reset()` from `onReset`, not native `<form>` reset. */
function ResetButton({
  onReset,
  confirmMessage,
  variant = "ghost",
  children = "Reset",
  ...props
}: ResetButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => {
        if (confirmMessage && typeof window !== "undefined" && !window.confirm(confirmMessage)) {
          return;
        }
        onReset();
      }}
      {...props}
    >
      <RotateCcw aria-hidden="true" />
      {children}
    </Button>
  );
}

export { ResetButton };
