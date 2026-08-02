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
import { useLayoutStore } from "@/store/layout-store";
import type { CommandGroupConfig } from "./types";

export interface CommandMenuProps {
  groups: CommandGroupConfig[];
  placeholder?: string;
}

/**
 * Global command palette (⌘K / Ctrl+K), à la Linear / VS Code. Mount
 * once near the root of `AppShell` — it self-registers the keyboard
 * shortcut and reads/writes its open state from `useLayoutStore`, so any
 * other component (a navbar search button, a sidebar item, …) can open
 * it by calling `useLayoutStore.getState().setCommandMenuOpen(true)`.
 */
export function CommandMenu({ groups, placeholder = "Type a command or search…" }: CommandMenuProps) {
  const open = useLayoutStore((state) => state.commandMenuOpen);
  const setOpen = useLayoutStore((state) => state.setCommandMenuOpen);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!useLayoutStore.getState().commandMenuOpen);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);

  const runAction = React.useCallback(
    (action: () => void) => {
      setOpen(false);
      action();
    },
    [setOpen]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command menu" description={placeholder}>
      <Command>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map((group, groupIndex) => (
            <React.Fragment key={group.id}>
              {groupIndex > 0 && <CommandSeparator />}
              <CommandGroup heading={group.heading}>
                {group.actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <CommandItem
                      key={action.id}
                      value={[action.label, ...(action.keywords ?? [])].join(" ")}
                      onSelect={() => runAction(action.onSelect)}
                    >
                      {Icon && <Icon />}
                      <span>{action.label}</span>
                      {action.shortcut && <CommandShortcut>{action.shortcut}</CommandShortcut>}
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
