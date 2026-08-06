import type * as React from "react";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export type RadioGroupOrientation = "horizontal" | "vertical" | "cards";

export interface RadioGroupFieldProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: RadioGroupOrientation;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: React.ReactNode;
  name?: string;
  className?: string;
}
