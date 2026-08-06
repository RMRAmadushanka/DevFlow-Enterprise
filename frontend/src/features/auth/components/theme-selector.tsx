"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ThemeSelectorProps {
  value?: "light" | "dark" | "system";
  onChange?: (theme: "light" | "dark" | "system") => void;
  className?: string;
}

const OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

function ThemeSelector({ value, onChange, className }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const current = value ?? (theme as "light" | "dark" | "system") ?? "system";

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("grid grid-cols-3 gap-2", className)}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = current === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            variant={selected ? "secondary" : "outline"}
            className="flex h-auto flex-col gap-1 py-3"
            onClick={() => {
              setTheme(option.value);
              onChange?.(option.value);
            }}
          >
            <Icon aria-hidden="true" />
            <span>{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

export { ThemeSelector };
