"use client";

import * as React from "react";
import { ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState, useDebouncedValue } from "@/components/forms/shared/hooks";
import { fieldControlSizeClassName } from "@/components/forms/shared/size";
import { iconCatalog, iconCatalogByName, iconCategories, type IconCategory } from "@/components/forms/shared/icon-catalog";
import type { IconPickerFieldProps } from "./types";

/** Searchable Lucide icon picker — category filter chips + a fixed-height virtualization-free grid (the ~150-icon curated catalog stays cheap to render in full). */
function IconPickerField({
  label,
  required,
  disabled,
  error,
  helperText,
  successText,
  validationState,
  size = "md",
  className,
  id,
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "Select an icon",
  clearable = true,
}: IconPickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<IconCategory | "All">("All");
  const debouncedQuery = useDebouncedValue(query, 150);

  const [internalValue, setInternalValue] = useControllableState<string | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const selected = internalValue ? iconCatalogByName[internalValue] : undefined;

  const filtered = iconCatalog.filter((entry) => {
    const matchesCategory = category === "All" || entry.category === category;
    const q = debouncedQuery.trim().toLowerCase();
    const matchesQuery =
      q === "" || entry.name.toLowerCase().includes(q) || entry.keywords.some((k) => k.includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <FieldShell
      label={label}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      successText={successText}
      validationState={validationState}
      size={size}
      className={className}
      id={id}
    >
      {({ controlId, ariaDescribedBy, ariaInvalid }) => (
        <div className="relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  id={controlId}
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  aria-invalid={ariaInvalid}
                  aria-describedby={ariaDescribedBy}
                  className={cn(
                    "w-full justify-between font-normal",
                    fieldControlSizeClassName[size],
                    !selected && "text-muted-foreground",
                    clearable && selected && "pr-8"
                  )}
                />
              }
            >
              <span className="flex items-center gap-2">
                {selected ? <selected.icon className="size-4" /> : null}
                {selected?.name ?? placeholder}
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </PopoverTrigger>

            <PopoverContent className="w-80 p-2.5" align="start">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search icons…"
                  className="pl-8"
                  autoFocus
                />
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {(["All", ...iconCategories] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "rounded-full border border-transparent px-2 py-0.5 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
                      category === cat && "border-border bg-muted text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-2 grid max-h-56 grid-cols-6 gap-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="col-span-6 py-6 text-center text-sm text-muted-foreground">No icons found.</p>
                ) : (
                  filtered.map((entry) => (
                    <button
                      key={entry.name}
                      type="button"
                      title={entry.name}
                      aria-label={entry.name}
                      onClick={() => {
                        setInternalValue(entry.name);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        internalValue === entry.name && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      <entry.icon className="size-4" />
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
          {clearable && selected ? (
            <button
              type="button"
              aria-label="Clear selection"
              className="absolute top-1/2 right-8 -translate-y-1/2 rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={() => setInternalValue(null)}
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      )}
    </FieldShell>
  );
}

export { IconPickerField };
