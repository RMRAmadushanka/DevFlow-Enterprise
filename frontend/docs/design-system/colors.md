# Colors

DevFlow uses **semantic color tokens**, never raw hex in feature code.

## Rules

- Use Tailwind utilities: `bg-primary`, `text-muted-foreground`, `border-border`
- Charts may use `var(--chart-1)` … `var(--chart-5)` or `@/design-system/tokens/colors`
- Status must never rely on color alone — always include a text label

## Core roles

| Token | Purpose |
|-------|---------|
| `primary` | Brand actions, focus |
| `secondary` | Secondary surfaces / buttons |
| `success` | Healthy / positive |
| `warning` | Caution |
| `danger` / `destructive` | Destructive / errors |
| `info` | Informational |
| `muted` | Quiet backgrounds / secondary text |

## Surfaces

`background` → `surface` → `card` → `elevated` describe increasing elevation.

## Theme modes

| Mode | Mechanism |
|------|-----------|
| Light | `:root` token values |
| Dark | `.dark` class (next-themes) |

Storybook toggles the same `.dark` class via `@storybook/addon-themes`.

## Full token tables

See [02-design-tokens.md](./02-design-tokens.md) and
[05-css-variables.md](./05-css-variables.md).
