import type * as React from "react";

export interface SwitchFieldProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "default";
  error?: string;
  name?: string;
  id?: string;
  className?: string;
  /** Where the switch sits relative to the label. @default "end" */
  switchPosition?: "start" | "end";
}
