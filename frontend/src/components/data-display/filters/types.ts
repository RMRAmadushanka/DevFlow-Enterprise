import type * as React from "react";
import type { DisplayOption } from "@/components/data-display/shared/types";

export type FilterOperator =
  | "eq"
  | "neq"
  | "contains"
  | "in"
  | "between"
  | "gt"
  | "lt"
  | "before"
  | "after";

export type FilterFieldType = "text" | "select" | "multi-select" | "date" | "date-range" | "number-range";

export interface FilterFieldDefinition<TField extends string = string> {
  id: TField;
  label: string;
  type: FilterFieldType;
  operators?: FilterOperator[];
  options?: DisplayOption[];
  icon?: React.ReactNode;
}

export interface FilterCondition<TField extends string = string> {
  id: string;
  field: TField;
  operator: FilterOperator;
  value: unknown;
}

export interface AdvancedFilterProps<TField extends string = string> {
  fields: FilterFieldDefinition<TField>[];
  value?: FilterCondition<TField>[];
  defaultValue?: FilterCondition<TField>[];
  onValueChange?: (conditions: FilterCondition<TField>[]) => void;
  /** Optional free-text search wired into the filter bar. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}
