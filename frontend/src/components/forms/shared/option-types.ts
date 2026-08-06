import type * as React from "react";

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectOptionGroup<TValue extends string = string> {
  label: string;
  options: SelectOption<TValue>[];
}

export type SelectOptionsInput<TValue extends string = string> =
  | SelectOption<TValue>[]
  | SelectOptionGroup<TValue>[];

export function isGroupedOptions<TValue extends string>(
  options: SelectOptionsInput<TValue>
): options is SelectOptionGroup<TValue>[] {
  return options.length > 0 && "options" in options[0];
}

export function flattenOptions<TValue extends string>(
  options: SelectOptionsInput<TValue>
): SelectOption<TValue>[] {
  return isGroupedOptions(options) ? options.flatMap((group) => group.options) : options;
}
