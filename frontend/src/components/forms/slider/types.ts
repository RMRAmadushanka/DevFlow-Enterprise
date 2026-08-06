import type * as React from "react";
import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface SliderMark {
  value: number;
  label?: React.ReactNode;
}

export interface SliderFieldProps extends Omit<BaseFieldProps, "loading"> {
  /** A single number, or a two-element array for a range slider. */
  value?: number | number[];
  defaultValue?: number | number[];
  onValueChange?: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  marks?: SliderMark[];
  /** Shows the live numeric value(s) beside the label. @default true */
  showValue?: boolean;
  formatValue?: (value: number) => string;
}
