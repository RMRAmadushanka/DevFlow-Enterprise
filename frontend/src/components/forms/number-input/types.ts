import type * as React from "react";
import type { BaseFieldProps } from "@/components/forms/shared/types";

export type NumberInputMode = "decimal" | "currency" | "percentage";

export interface NumberInputProps extends BaseFieldProps {
  value?: number | null;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  /** @default true */
  allowNegative?: boolean;
  /** Fraction digits to format/round to. @default 0 for "decimal", 2 for "currency", 0 for "percentage" */
  decimalPlaces?: number;
  /** @default "decimal" */
  mode?: NumberInputMode;
  /** ISO 4217 code, only used when `mode="currency"`. @default "USD" */
  currencyCode?: string;
  locale?: string;
  /** Shows the +/- stepper buttons. @default true */
  showStepper?: boolean;
}
