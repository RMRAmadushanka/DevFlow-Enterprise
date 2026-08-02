# 3. Theme Architecture

## Modes

Three modes are supported, per the brief: **Dark**, **Light**, **System**.
Dark is the default (`defaultTheme="dark"` in the root `ThemeProvider`).

## How it works

1. **`next-themes`** ([`src/design-system/theme/theme-provider.tsx`](../../src/design-system/theme/theme-provider.tsx))
   drives an `attribute="class"` strategy: it toggles a `.dark` class on
   `<html>`. It also injects a blocking inline script so the correct theme
   class is present **before first paint** — no flash of the wrong theme.
2. **CSS variables** in [`globals.css`](../../src/app/globals.css) are
   declared twice: once under `:root` (light values) and once under
   `.dark` (dark values). Every component only ever reads the *semantic*
   variable name (`--primary`, `--surface`, …), so it never needs to know
   which theme is active.
3. **Tailwind's `@theme inline`** block maps each semantic CSS variable to
   a `--color-*` theme variable, which is what makes `bg-primary`,
   `text-text-secondary`, etc. exist as utility classes. Because the
   mapping is `inline` (i.e. `--color-primary: var(--primary)`), Tailwind
   re-resolves it live whenever `--primary` changes — which is exactly
   what happens when `.dark` is toggled.
4. **`enableSystem`** is set, so `system` resolves to the OS-level
   `prefers-color-scheme` and stays in sync if the OS theme changes while
   the app is open.

```
User picks theme ──▶ next-themes writes localStorage + toggles .dark
                                        │
                                        ▼
                     :root / .dark blocks swap CSS variable values
                                        │
                                        ▼
        Tailwind utility classes (bg-primary, text-foreground, …)
              re-render with the new resolved color — no JS re-render
                       of the actual color values needed
```

## Usage

Mount once, at the root layout — never more than once:

```tsx
// src/app/layout.tsx
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
  <AppProviders>{children}</AppProviders>
</ThemeProvider>
```

Switch theme anywhere below the provider:

```tsx
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();
setTheme("light" | "dark" | "system");
```

A ready-made control exists at
[`src/design-system/theme/theme-toggle.tsx`](../../src/design-system/theme/theme-toggle.tsx)
(`<ThemeToggle />`) — a dropdown with Light / Dark / System.

## Why `disableTransitionOnChange`

Without it, every element with a `transition` on `background-color` /
`color` would visibly cross-fade when the theme changes, which reads as
laggy on a page with hundreds of elements. Disabling it makes the theme
swap instantaneous, matching how Linear/GitHub/Vercel do it.

## Rules for consuming the theme

- **Never** branch rendering logic on `theme === "dark"` inside a
  component to pick a color — express the difference as a token in
  `globals.css` instead. Component code should be theme-agnostic.
- **Never** read `window.matchMedia("(prefers-color-scheme: dark)")`
  directly — that's what `enableSystem` already does.
- If a value must be computed in JS (e.g. for a `<canvas>` or a charting
  library that can't take CSS variables), read the *live* CSS variable at
  render/paint time (`getComputedStyle(el).getPropertyValue("--primary")`)
  rather than hardcoding light/dark branches — this way it stays correct
  even if the token values are retuned later.
