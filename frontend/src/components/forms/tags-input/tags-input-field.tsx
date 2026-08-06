"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState } from "@/components/forms/shared/hooks";
import { duration, easing } from "@/design-system/tokens/motion";
import type { TagsInputProps } from "./types";

/** Free-form tag entry — `Enter`/`,` commits a tag, `Backspace` on an empty input deletes the last one, with an optional filtered-suggestions dropdown. */
function TagsInputField({
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
  defaultValue = [],
  onValueChange,
  suggestions,
  maxTags,
  placeholder = "Add a tag…",
  allowDuplicates = false,
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [tags, setTags] = useControllableState<string[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const atMax = maxTags !== undefined && tags.length >= maxTags;

  const filteredSuggestions = (suggestions ?? []).filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      (allowDuplicates || !tags.includes(suggestion))
  );

  function commitTag(raw: string) {
    const tag = raw.trim();
    if (!tag || atMax) return;
    if (!allowDuplicates && tags.includes(tag)) {
      setInputValue("");
      return;
    }
    setTags([...tags, tag]);
    setInputValue("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitTag(inputValue);
    } else if (event.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <FieldShell
      label={label}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText ?? (maxTags ? `${tags.length} of ${maxTags} tags` : undefined)}
      successText={successText}
      validationState={validationState}
      size={size}
      className={className}
      id={id}
    >
      {({ controlId, ariaDescribedBy, ariaInvalid }) => (
        <div className="relative">
          <div
            onClick={() => inputRef.current?.focus()}
            data-disabled={disabled || undefined}
            aria-invalid={ariaInvalid}
            className="flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:bg-input/30"
          >
            <AnimatePresence initial={false}>
              {tags.map((tag) => (
                <motion.span
                  key={tag}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: duration.instant, ease: easing.accelerate } }}
                  transition={{ duration: duration.fast, ease: easing.decelerate }}
                >
                  <Badge variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove ${tag}`}
                      disabled={disabled}
                      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                </motion.span>
              ))}
            </AnimatePresence>
            <input
              ref={inputRef}
              id={controlId}
              type="text"
              value={inputValue}
              disabled={disabled || atMax}
              placeholder={tags.length === 0 ? placeholder : ""}
              aria-describedby={ariaDescribedBy}
              onChange={(event) => {
                setInputValue(event.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              className="min-w-20 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
          </div>

          <AnimatePresence>
            {showSuggestions && inputValue && filteredSuggestions.length > 0 ? (
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: duration.fast, ease: easing.decelerate }}
                className="absolute z-50 mt-1 flex w-full flex-col gap-0.5 rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10"
              >
                {filteredSuggestions.slice(0, 8).map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      className="w-full rounded-md px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => commitTag(suggestion)}
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </FieldShell>
  );
}

export { TagsInputField };
