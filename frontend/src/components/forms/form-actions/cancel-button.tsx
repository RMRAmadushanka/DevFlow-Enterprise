import * as React from "react";

import { Button } from "@/components/ui/button";

export type CancelButtonProps = Omit<React.ComponentProps<typeof Button>, "type">;

/** A neutral, non-destructive way out of a form. Always `type="button"` so it never triggers submission. */
function CancelButton({ variant = "outline", children = "Cancel", ...props }: CancelButtonProps) {
  return (
    <Button type="button" variant={variant} {...props}>
      {children}
    </Button>
  );
}

export { CancelButton };
