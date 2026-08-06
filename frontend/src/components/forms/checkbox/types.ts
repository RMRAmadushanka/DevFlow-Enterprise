import type * as React from "react";

export interface CheckboxFieldProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Renders the mixed/dash visual state — typically driven by a parent "select all" checkbox. */
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
  /** Marks this checkbox as the "select all" parent of an enclosing `CheckboxGroup`. */
  parent?: boolean;
}

export interface CheckboxGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupFieldProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  options: CheckboxGroupOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Adds a "Select all" parent checkbox with automatic indeterminate state. */
  showSelectAll?: boolean;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  error?: string;
  helperText?: React.ReactNode;
  className?: string;
}
