"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { FormRequiredIndicator } from "./form-required-indicator";

function FormLabel({
  className,
  required,
  children,
  ...props
}: FieldPrimitive.Label.Props & { required?: boolean }) {
  return (
    <FieldPrimitive.Label
      data-slot="form-label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium text-foreground select-none group-data-disabled/form-field:pointer-events-none group-data-disabled/form-field:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {required ? <FormRequiredIndicator /> : null}
    </FieldPrimitive.Label>
  );
}

export { FormLabel };
