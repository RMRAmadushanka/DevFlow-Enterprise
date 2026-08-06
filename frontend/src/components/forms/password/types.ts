import type * as React from "react";
import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface PasswordInputProps extends BaseFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  minLength?: number;
  /** Renders the live strength meter + rule checklist below the field. */
  showStrengthIndicator?: boolean;
  /** Shows a "Generate" button that fills the field with a strong random password. */
  showGenerateButton?: boolean;
  /** Shows a "Copy" button (only meaningful once there's a value). */
  showCopyButton?: boolean;
  /** Warns when Caps Lock is on while the field is focused. @default true */
  warnCapsLock?: boolean;
}
