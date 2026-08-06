import type * as React from "react";
import type { BaseFieldProps } from "@/components/forms/shared/types";

export type TextInputType = "text" | "email" | "url" | "tel" | "search";

export interface TextInputProps extends BaseFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  readOnly?: boolean;
  type?: TextInputType;
  /** Leading icon, e.g. `<Mail />`. */
  icon?: React.ReactNode;
  /** Leading text/element rendered before the value, e.g. `"https://"`. */
  prefix?: React.ReactNode;
  /** Trailing text/element rendered after the value, e.g. `"kg"`. */
  suffix?: React.ReactNode;
  /** Shows a clear ("x") button once there's a value. */
  clearButton?: boolean;
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}
