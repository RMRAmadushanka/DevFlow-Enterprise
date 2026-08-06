"use client";

import * as React from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useControllableState } from "@/components/data-display/shared/hooks";
import type { CommandPaletteProps } from "./types";

/**
 * Standalone command palette (Linear / VS Code style). Fully controlled or
 * uncontrolled; optional ⌘K shortcut. For the shell-integrated instance that
 * shares open state with the navbar, use `layout/command-menu`.
 */
function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Search commands…",
  enableShortcut = true,
  recent,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useControllableState({
    value: open,
    defaultValue: false,
    onChange: onOpenChange,
  });

  React.useEffect(() => {
    if (!enableShortcut) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setInternalOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut, setInternalOpen]);

  const run = React.useCallback(
    (action: () => void) => {
      setInternalOpen(false);
      action();
    },
    [setInternalOpen]
  );

  return (
    <CommandDialog
      open={internalOpen}
      onOpenChange={setInternalOpen}
      title="Command menu"
      description={placeholder}
    >
      <Command>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {recent && recent.length > 0 ? (
            <>
              <CommandGroup heading="Recent">
                {recent.map((action) => {
                  const Icon = action.icon;
                  return (
                    <CommandItem
                      key={action.id}
                      value={[action.label, ...(action.keywords ?? [])].join(" ")}
                      onSelect={() => run(action.onSelect)}
                    >
                      {Icon ? <Icon /> : null}
                      <span>{action.label}</span>
                      {action.shortcut ? <CommandShortcut>{action.shortcut}</CommandShortcut> : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          ) : null}
          {groups.map((group, index) => (
            <React.Fragment key={group.id}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group.heading}>
                {group.actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <CommandItem
                      key={action.id}
                      value={[action.label, ...(action.keywords ?? [])].join(" ")}
                      onSelect={() => run(action.onSelect)}
                    >
                      {Icon ? <Icon /> : null}
                      <span>{action.label}</span>
                      {action.shortcut ? <CommandShortcut>{action.shortcut}</CommandShortcut> : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export { CommandPalette };
