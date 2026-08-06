"use client";

import * as React from "react";
import { Filter, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobalSearchInput } from "@/components/data-display/search";
import { useControllableState, useDisplayId } from "@/components/data-display/shared/hooks";
import { FilterChip } from "./filter-chip";
import type {
  AdvancedFilterProps,
  FilterCondition,
  FilterFieldDefinition,
  FilterOperator,
} from "./types";

const DEFAULT_OPERATORS: Record<FilterFieldDefinition["type"], FilterOperator[]> = {
  text: ["eq", "contains", "neq"],
  select: ["eq", "neq"],
  "multi-select": ["in"],
  date: ["eq", "before", "after"],
  "date-range": ["between"],
  "number-range": ["between", "gt", "lt", "eq"],
};

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: "is",
  neq: "is not",
  contains: "contains",
  in: "is any of",
  between: "is between",
  gt: "is greater than",
  lt: "is less than",
  before: "is before",
  after: "is after",
};

function formatConditionLabel(
  condition: FilterCondition,
  fields: FilterFieldDefinition[]
): string {
  const field = fields.find((entry) => entry.id === condition.field);
  const fieldLabel = field?.label ?? condition.field;
  const op = OPERATOR_LABELS[condition.operator] ?? condition.operator;
  const raw = condition.value;

  let valueLabel: string;
  if (Array.isArray(raw)) {
    valueLabel = raw
      .map((entry) => field?.options?.find((option) => option.value === entry)?.label ?? String(entry))
      .join(", ");
  } else if (raw && typeof raw === "object" && "from" in (raw as object)) {
    const range = raw as { from?: string; to?: string };
    valueLabel = [range.from, range.to].filter(Boolean).join(" – ");
  } else {
    valueLabel =
      field?.options?.find((option) => option.value === raw)?.label ?? String(raw ?? "");
  }

  return `${fieldLabel} ${op} ${valueLabel}`.trim();
}

/**
 * Composable filter bar: optional search, active condition chips, and a
 * popover to add new conditions across text/select/date/range fields.
 * Fully controlled — the caller owns filtering logic.
 */
function AdvancedFilter<TField extends string = string>({
  fields,
  value,
  defaultValue = [],
  onValueChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  disabled,
  className,
}: AdvancedFilterProps<TField>) {
  const [conditions, setConditions] = useControllableState<FilterCondition<TField>[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [open, setOpen] = React.useState(false);
  const [draftField, setDraftField] = React.useState<TField | "">(fields[0]?.id ?? "");
  const [draftOperator, setDraftOperator] = React.useState<FilterOperator>("eq");
  const [draftValue, setDraftValue] = React.useState("");
  const [draftTo, setDraftTo] = React.useState("");
  const formId = useDisplayId();

  const selectedField = fields.find((field) => field.id === draftField);
  const operators =
    selectedField?.operators ??
    (selectedField ? DEFAULT_OPERATORS[selectedField.type] : ["eq"]);

  React.useEffect(() => {
    if (selectedField) {
      const nextOps = selectedField.operators ?? DEFAULT_OPERATORS[selectedField.type];
      setDraftOperator(nextOps[0] ?? "eq");
      setDraftValue("");
      setDraftTo("");
    }
  }, [selectedField]);

  function addCondition() {
    if (!draftField || draftValue === "") return;

    const nextValue =
      draftOperator === "between"
        ? { from: draftValue, to: draftTo }
        : selectedField?.type === "multi-select"
          ? draftValue.split(",").map((part) => part.trim()).filter(Boolean)
          : draftValue;

    const next: FilterCondition<TField> = {
      id: `${draftField}-${Date.now()}`,
      field: draftField,
      operator: draftOperator,
      value: nextValue,
    };
    setConditions((prev) => [...prev, next]);
    setDraftValue("");
    setDraftTo("");
    setOpen(false);
  }

  function removeCondition(id: string) {
    setConditions((prev) => prev.filter((condition) => condition.id !== id));
  }

  return (
    <div
      data-slot="advanced-filter"
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex flex-wrap items-center gap-2">
        {onSearchChange ? (
          <GlobalSearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            disabled={disabled}
            shortcut={null}
            className="min-w-[12rem] flex-1 sm:max-w-xs"
          />
        ) : null}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button type="button" variant="outline" size="sm" disabled={disabled} className="gap-1.5" />
            }
          >
            <Filter className="size-3.5" />
            Add filter
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 gap-3">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${formId}-field`}>Field</Label>
                <Select
                  value={draftField || null}
                  onValueChange={(next) => setDraftField((next as TField) ?? "")}
                >
                  <SelectTrigger id={`${formId}-field`} className="w-full">
                    <SelectValue placeholder="Choose field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${formId}-operator`}>Condition</Label>
                <Select
                  value={draftOperator}
                  onValueChange={(next) => setDraftOperator((next as FilterOperator) ?? "eq")}
                >
                  <SelectTrigger id={`${formId}-operator`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((operator) => (
                      <SelectItem key={operator} value={operator}>
                        {OPERATOR_LABELS[operator]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${formId}-value`}>Value</Label>
                {selectedField?.type === "select" && selectedField.options ? (
                  <Select value={draftValue || null} onValueChange={(next) => setDraftValue(String(next ?? ""))}>
                    <SelectTrigger id={`${formId}-value`} className="w-full">
                      <SelectValue placeholder="Choose value" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedField.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`${formId}-value`}
                    type={
                      selectedField?.type === "date" || selectedField?.type === "date-range"
                        ? "date"
                        : selectedField?.type === "number-range"
                          ? "number"
                          : "text"
                    }
                    value={draftValue}
                    onChange={(event) => setDraftValue(event.target.value)}
                    placeholder={
                      selectedField?.type === "multi-select" ? "Comma-separated values" : "Enter value"
                    }
                  />
                )}
              </div>

              {draftOperator === "between" ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${formId}-to`}>To</Label>
                  <Input
                    id={`${formId}-to`}
                    type={
                      selectedField?.type === "date-range"
                        ? "date"
                        : selectedField?.type === "number-range"
                          ? "number"
                          : "text"
                    }
                    value={draftTo}
                    onChange={(event) => setDraftTo(event.target.value)}
                  />
                </div>
              ) : null}

              <Button type="button" size="sm" onClick={addCondition} className="gap-1.5">
                <Plus className="size-3.5" />
                Apply filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {conditions.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => setConditions([])}
          >
            Clear all
          </Button>
        ) : null}
      </div>

      {conditions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5" aria-label="Active filters">
          {conditions.map((condition) => (
            <FilterChip
              key={condition.id}
              label={formatConditionLabel(condition, fields)}
              onRemove={disabled ? undefined : () => removeCondition(condition.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { AdvancedFilter };
