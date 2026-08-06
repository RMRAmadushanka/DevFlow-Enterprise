"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  FormField,
  FormLabel,
  FormDescription,
  FormHint,
  FormErrorMessage,
  FormSuccessMessage,
} from "@/components/forms/form-layout";
import { useFieldId } from "./hooks";
import type { BaseFieldProps, ValidationState } from "./types";

export interface FieldShellRenderProps {
  controlId: string;
  ariaDescribedBy: string | undefined;
  ariaInvalid: boolean;
  validationState: ValidationState;
  /**
   * The rendered label's `id`, present whenever `label` is set. `<label
   * htmlFor>` only computes an accessible name for natively "labelable"
   * elements (`input`/`select`/`textarea`/`button`/…) — custom
   * `role="combobox"`/`role="textbox"`/`role="slider"` controls built on a
   * plain `<div>` must wire this in via `aria-labelledby` instead.
   */
  ariaLabelledBy: string | undefined;
}

export interface FieldShellProps extends Omit<BaseFieldProps, "name"> {
  description?: React.ReactNode;
  /** Extra content rendered inline with the label (e.g. a character counter). */
  labelSuffix?: React.ReactNode;
  /** Visually hides the label while keeping it in the accessibility tree. */
  hideLabel?: boolean;
  labelClassName?: string;
  /** Wraps the rendered control — useful for `relative` positioning of icons/buttons. */
  contentClassName?: string;
  children: React.ReactNode | ((renderProps: FieldShellRenderProps) => React.ReactNode);
}

/**
 * Internal composition helper used by every field in `components/forms/*`
 * to render a consistent label / description / control / status-message
 * stack on top of the `form-layout` primitives. Not part of the public
 * folder-structure spec, but the single place that structure is
 * implemented — extend this, not each field, when the shared chrome needs
 * to change.
 */
function FieldShell({
  id,
  label,
  required,
  disabled,
  description,
  error,
  helperText,
  successText,
  validationState,
  className,
  labelClassName,
  contentClassName,
  labelSuffix,
  hideLabel,
  children,
}: FieldShellProps) {
  const controlId = useFieldId(id);
  const descriptionId = `${controlId}-description`;
  const statusId = `${controlId}-status`;
  const labelId = `${controlId}-label`;

  const effectiveState: ValidationState =
    validationState ?? (error ? "error" : successText ? "success" : "default");

  const ariaDescribedBy =
    [description ? descriptionId : null, error || successText || helperText ? statusId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const renderProps: FieldShellRenderProps = {
    controlId,
    ariaDescribedBy,
    ariaInvalid: effectiveState === "error",
    validationState: effectiveState,
    ariaLabelledBy: label ? labelId : undefined,
  };

  return (
    <FormField
      invalid={effectiveState === "error"}
      disabled={disabled}
      className={cn("gap-1.5", className)}
    >
      {label ? (
        <div className={cn("flex items-center justify-between gap-2", hideLabel && "sr-only")}>
          <FormLabel id={labelId} htmlFor={controlId} required={required} className={labelClassName}>
            {label}
          </FormLabel>
          {labelSuffix && !hideLabel ? (
            <span className="text-xs text-muted-foreground">{labelSuffix}</span>
          ) : null}
        </div>
      ) : null}
      {description ? (
        <FormDescription id={descriptionId}>{description}</FormDescription>
      ) : null}
      <div className={contentClassName}>
        {typeof children === "function" ? children(renderProps) : children}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <FormErrorMessage key="error" id={statusId}>
            {error}
          </FormErrorMessage>
        ) : successText ? (
          <FormSuccessMessage key="success" id={statusId}>
            {successText}
          </FormSuccessMessage>
        ) : helperText ? (
          <FormHint key="hint" id={statusId}>
            {helperText}
          </FormHint>
        ) : null}
      </AnimatePresence>
    </FormField>
  );
}

export { FieldShell };
