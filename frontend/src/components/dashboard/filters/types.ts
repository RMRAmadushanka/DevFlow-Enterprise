export interface ChartFilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ChartFilterDefinition {
  id: string;
  label: string;
  options: ChartFilterOption[];
  /** Placeholder when nothing selected. */
  placeholder?: string;
  /** Allow clearing back to empty. @default true */
  clearable?: boolean;
}

export interface ChartFilterProps {
  filters: ChartFilterDefinition[];
  /** Map of filter id → selected value. */
  value: Record<string, string | null>;
  onChange: (next: Record<string, string | null>) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}
