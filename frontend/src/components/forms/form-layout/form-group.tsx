"use client";

import * as React from "react";
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset";

import { cn } from "@/lib/utils";

/**
 * Groups a set of related controls (a checkbox list, a radio group, an
 * address sub-form) under one shared legend. Renders a real `<fieldset>` +
 * `<legend>` — screen readers announce the legend before each control's own
 * label, which a `<div>` + heading never does.
 */
function FormGroup({
  className,
  legend,
  description,
  children,
  disabled,
  ...props
}: FieldsetPrimitive.Root.Props & {
  legend?: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <FieldsetPrimitive.Root
      data-slot="form-group"
      disabled={disabled}
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {legend ? (
        <div className="flex flex-col gap-1">
          <FieldsetPrimitive.Legend className="text-sm font-medium text-foreground">
            {legend}
          </FieldsetPrimitive.Legend>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-2.5">{children}</div>
    </FieldsetPrimitive.Root>
  );
}

export { FormGroup };
