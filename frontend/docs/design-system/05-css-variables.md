# 5. CSS Variables Reference

All custom properties live in
[`src/app/globals.css`](../../src/app/globals.css). This page documents
the **raw variable names** (for use in plain CSS, inline `style`, or
`getComputedStyle` reads) as opposed to [Design Tokens](./02-design-tokens.md),
which documents the Tailwind utility classes built on top of them.

## Structure of the file

```css
@custom-variant dark (&:is(.dark *));   /* defines how `dark:` variants match */

@theme inline { /* … theme-reactive color + radius → Tailwind mappings … */ }

@theme { /* … static typography, shadow, breakpoint, easing tokens … */ }

:root { /* light theme raw values */ }

.dark { /* dark theme raw values */ }

@layer base { /* element defaults, selection, scrollbar, focus ring */ }
```

## Raw variable names (theme-reactive — differ between `:root` and `.dark`)

```
--background        --surface            --card               --card-foreground
--elevated           --elevated-foreground
--sidebar            --sidebar-foreground --sidebar-border     --sidebar-accent
--sidebar-accent-foreground --sidebar-primary --sidebar-primary-foreground --sidebar-ring
--border             --divider            --input              --ring
--primary            --primary-foreground --primary-hover      --primary-active --primary-muted
--secondary          --secondary-foreground --secondary-hover
--accent             --accent-foreground
--muted              --muted-foreground
--popover            --popover-foreground
--success            --success-foreground --success-muted
--warning            --warning-foreground --warning-muted
--danger             --danger-foreground  --danger-muted
--info               --info-foreground    --info-muted
--text-primary       --text-secondary     --text-muted
--disabled           --disabled-foreground
--link               --link-hover
--selection          --focus-ring
--chart-1 … --chart-5
--radius             (base value; radius scale is derived from this)
```

## Static variable names (identical in both themes)

Defined once in the plain `@theme` block — typography, shadow,
breakpoint, and easing tokens. These don't need `:root`/`.dark` pairs
because they don't change with theme:

```
--text-display / --text-heading / --text-title / --text-subtitle
--text-body / --text-body-strong / --text-caption / --text-small
--text-label / --text-button / --text-code
  (each has --*-line-height, --*-letter-spacing, --*-font-weight)

--shadow-none / --shadow-xs / --shadow-sm / --shadow-md / --shadow-lg
--shadow-overlay / --shadow-modal / --shadow-dropdown

--breakpoint-xs / --breakpoint-sm / --breakpoint-md / --breakpoint-lg
--breakpoint-xl / --breakpoint-2xl / --breakpoint-3xl

--ease-standard / --ease-emphasized / --ease-decelerate / --ease-accelerate
```

## Reading a variable at runtime

```ts
const primary = getComputedStyle(document.documentElement)
  .getPropertyValue("--primary")
  .trim();
```

Use this only when a library truly cannot accept a Tailwind class or CSS
value (e.g. a `<canvas>` drawing call, or a third-party charting library
config object). For everything else, use the Tailwind utility class.

## Adding a new variable — checklist

1. Add the raw value to **both** `:root` and `.dark` (or to the static
   `@theme` block if it's not theme-reactive).
2. If it's a color, add the `--color-*` mapping under `@theme inline`.
3. Mirror it in `src/design-system/tokens/*.ts`.
4. Document it in [Design Tokens](./02-design-tokens.md).
5. Never reference the raw hex/oklch value anywhere else in the codebase.
