"use client";

import * as React from "react";
import { Check, Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useClipboard, useControllableState } from "@/components/forms/shared/hooks";
import { fieldControlSizeClassName } from "@/components/forms/shared/size";
import { duration, easing } from "@/design-system/tokens/motion";
import { PasswordStrengthMeter } from "./password-strength-meter";
import { generateStrongPassword } from "./generate-password";
import type { PasswordInputProps } from "./types";

function PasswordInput({
  label,
  required,
  disabled,
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
  placeholder = "Enter your password",
  autoComplete = "current-password",
  autoFocus,
  minLength,
  showStrengthIndicator,
  showGenerateButton,
  showCopyButton,
  warnCapsLock = true,
}: PasswordInputProps) {
  const [internalValue, setInternalValue] = useControllableState({
    value,
    defaultValue,
    onChange,
  });
  const [visible, setVisible] = React.useState(false);
  const [capsLockOn, setCapsLockOn] = React.useState(false);
  const { copied, copy } = useClipboard();

  const handleKeyEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!warnCapsLock) return;
    setCapsLockOn(event.getModifierState?.("CapsLock") ?? false);
  };

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
        <div className="flex flex-col gap-2">
          <InputGroup className={fieldControlSizeClassName[size]}>
            <InputGroupInput
              id={controlId}
              name={name}
              type={visible ? "text" : "password"}
              value={internalValue}
              onChange={(event) => setInternalValue(event.target.value)}
              onBlur={onBlur}
              onKeyDown={handleKeyEvent}
              onKeyUp={handleKeyEvent}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              minLength={minLength}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedBy}
            />
            <InputGroupAddon align="inline-end">
              {showGenerateButton ? (
                <InputGroupButton
                  type="button"
                  aria-label="Generate a strong password"
                  size="icon-xs"
                  onClick={() => setInternalValue(generateStrongPassword())}
                >
                  <RefreshCw />
                </InputGroupButton>
              ) : null}
              {showCopyButton ? (
                <InputGroupButton
                  type="button"
                  aria-label="Copy password"
                  size="icon-xs"
                  disabled={!internalValue}
                  onClick={() => copy(internalValue)}
                >
                  {copied ? <Check /> : <Copy />}
                </InputGroupButton>
              ) : null}
              <InputGroupButton
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                size="icon-xs"
                onClick={() => setVisible((v) => !v)}
              >
                {visible ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <AnimatePresence initial={false}>
            {warnCapsLock && capsLockOn ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: duration.fast, ease: easing.decelerate }}
                role="status"
                className="text-xs font-medium text-warning"
              >
                Caps Lock is on
              </motion.p>
            ) : null}
          </AnimatePresence>

          {showStrengthIndicator ? <PasswordStrengthMeter value={internalValue} /> : null}
        </div>
      )}
    </FieldShell>
  );
}

export { PasswordInput };
