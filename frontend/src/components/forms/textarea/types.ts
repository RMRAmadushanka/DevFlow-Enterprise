import type * as React from "react";
import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface TextareaFieldProps extends BaseFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  /** Shows a live "N / max" character counter under the field. Requires `maxLength`. */
  showCounter?: boolean;
  /** Grows with content instead of scrolling. @default true */
  autoResize?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}
