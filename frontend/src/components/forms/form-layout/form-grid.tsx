import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const formGridVariants = cva("grid w-full gap-4", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    },
  },
  defaultVariants: {
    columns: 2,
  },
});

/** Responsive CSS grid for laying out many fields at once — collapses to one column on mobile. */
function FormGrid({
  className,
  columns,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof formGridVariants>) {
  return (
    <div
      data-slot="form-grid"
      className={cn(formGridVariants({ columns }), className)}
      {...props}
    />
  );
}

export { FormGrid, formGridVariants };
