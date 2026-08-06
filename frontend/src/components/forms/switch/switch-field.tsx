"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { FormField, FormErrorMessage } from "@/components/forms/form-layout";
import { useFieldId } from "@/components/forms/shared/hooks";
import type { SwitchFieldProps } from "./types";

/** A labeled on/off toggle — the standard "settings row" pattern (label + description on one side, switch on the other). */
function SwitchField({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  loading,
  size = "default",
  error,
  name,
  id,
  className,
  switchPosition = "end",
}: SwitchFieldProps) {
  const controlId = useFieldId(id);
  const descriptionId = `${controlId}-description`;

  const control = loading ? (
    <div className="flex h-[18.4px] w-8 items-center justify-center">
      <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  ) : (
    <Switch
      id={controlId}
      name={name}
      size={size}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={description ? descriptionId : undefined}
    />
  );

  const content = (label || description) && (
    <div className="flex flex-1 flex-col gap-0.5">
      {label ? (
        <label
          htmlFor={controlId}
          className={cn(
            "text-sm font-medium text-foreground select-none",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          {label}
        </label>
      ) : null}
      {description ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );

  return (
    <FormField invalid={!!error} disabled={disabled} className={cn("gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        {switchPosition === "start" ? (
          <>
            {control}
            {content}
          </>
        ) : (
          <>
            {content}
            {control}
          </>
        )}
      </div>
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormField>
  );
}

export { SwitchField };
