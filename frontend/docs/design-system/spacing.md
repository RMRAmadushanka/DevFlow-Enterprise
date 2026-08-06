# Spacing

Spacing follows a **4px grid** expressed through Tailwind spacing utilities
and design-system tokens.

## Rules

- Prefer `gap-*`, `p-*`, `m-*` from the Tailwind scale
- Avoid magic numbers (`p-[13px]`, `top-[22px]`) unless aligning to a known optical exception
- Page rhythm: `PageContainer` provides vertical padding; templates own section gaps
- Compact vs comfortable density is a product concern — use shared density props where available

## Common patterns

| Context | Guidance |
|---------|----------|
| Stack of form fields | `gap-4` / form layout primitives |
| Card internals | Card spacing tokens (`--card-spacing`) |
| Dashboard grid | `DashboardGrid` `gap` prop (`2–8`) |
| Page sections | `gap-6` between header / toolbar / content |

## Deep dive

[02-design-tokens.md](./02-design-tokens.md), `src/design-system/tokens/spacing.ts`,
`src/design-system/tokens/grid.ts`.
