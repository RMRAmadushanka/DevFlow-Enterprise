import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Container — enforces the grid system's max content width + responsive
 * margins (see `src/design-system/tokens/grid.ts`). Wrap page-level content
 * in this instead of hand-rolling `max-w-*` + `px-*` combinations.
 */
const containerVariants = cva("mx-auto w-full", {
  variants: {
    size: {
      full: "max-w-none",
      wide: "max-w-(--breakpoint-2xl)",
      default: "max-w-(--breakpoint-3xl)",
      narrow: "max-w-(--breakpoint-lg)",
    },
    gutter: {
      none: "px-0",
      default: "px-4 sm:px-6 lg:px-8 3xl:px-20",
      compact: "px-4 sm:px-6",
    },
  },
  defaultVariants: {
    size: "default",
    gutter: "default",
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

function Container({ className, size, gutter, ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn(containerVariants({ size, gutter }), className)}
      {...props}
    />
  );
}

export { Container, containerVariants };
