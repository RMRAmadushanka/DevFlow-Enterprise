"use client";

/**
 * Theme Architecture
 * ---------------------------------------------------------------------------
 * Wraps `next-themes` to drive the `.dark` / `:root` class swap that all
 * semantic color tokens in `globals.css` respond to.
 *
 * Supported modes: "dark" | "light" | "system"
 * Default mode: "dark" (dark-mode-first product, per design philosophy).
 *
 * Usage: mount once at the root layout. Never mount a second instance.
 */
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
