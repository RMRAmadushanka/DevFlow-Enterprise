"use client";

import * as React from "react";
import { Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState } from "@/components/forms/shared/hooks";
import { fieldControlSizeClassName, fieldIconSizeClassName } from "@/components/forms/shared/size";
import type { TextInputProps } from "./types";

/**
 * The base single-line text input for the Enterprise Form System. Every
 * other simple text-shaped field (`SearchInput`, `CurrencyInput`'s prefix
 * chrome, etc.) either wraps this or mirrors its structure.
 */
function TextInput({
  label,
  required,
  disabled,
  loading,
  error,
  helperText,
  successText,
  validationState,
  size = "md",
  className,
  id,
  name,
  value,
  defaultValue = "",
  onChange,
  onBlur,
  onFocus,
  placeholder,
  readOnly,
  type = "text",
  icon,
  prefix,
  suffix,
  clearButton,
  maxLength,
  autoComplete,
  autoFocus,
  inputRef,
}: TextInputProps) {
  const [internalValue, setInternalValue] = useControllableState({
    value,
    defaultValue,
    onChange,
  });

  return (
    <FieldShell
      label={label}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      successText={successText}
      validationState={validationState}
      size={size}
      className={className}
      id={id}
    >
      {({ controlId, ariaDescribedBy, ariaInvalid }) => (
        <InputGroup
          data-disabled={disabled || undefined}
          className={cn(fieldControlSizeClassName[size], "has-[>[data-align=inline-end]]:pr-1")}
        >
          {icon ? (
            <InputGroupAddon>
              <span className={fieldIconSizeClassName[size]}>{icon}</span>
            </InputGroupAddon>
          ) : null}
          {prefix ? (
            <InputGroupAddon className="text-muted-foreground">{prefix}</InputGroupAddon>
          ) : null}
          <InputGroupInput
            id={controlId}
            name={name}
            type={type}
            value={internalValue}
            onChange={(event) => setInternalValue(event.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={disabled || loading}
            readOnly={readOnly}
            required={required}
            maxLength={maxLength}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            ref={inputRef}
          />
          {loading ? (
            <InputGroupAddon align="inline-end">
              <Loader2 className={cn(fieldIconSizeClassName[size], "animate-spin")} aria-hidden="true" />
            </InputGroupAddon>
          ) : null}
          {!loading && clearButton && internalValue ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Clear"
                size="icon-xs"
                onClick={() => setInternalValue("")}
              >
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
          {!loading && suffix ? (
            <InputGroupAddon align="inline-end" className="text-muted-foreground">
              {suffix}
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      )}
    </FieldShell>
  );
}

export { TextInput };
