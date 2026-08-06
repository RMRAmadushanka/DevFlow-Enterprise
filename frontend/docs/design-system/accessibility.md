# Accessibility

**WCAG 2.2 AA** is the baseline for every shared component.

## Required for every component

| Requirement | Expectation |
|-------------|-------------|
| Keyboard | All actions reachable without a pointer |
| Focus | Visible `focus-visible` ring using tokenized `ring` |
| Name | Icon-only controls have `aria-label` / visible text |
| Structure | Correct roles/headings; no invalid nesting |
| Contrast | Text/icons meet AA against their background |
| Status | Color + text (never color alone) |
| Motion | Respect reduced motion where animations are non-essential |

## Overlays

Modals, drawers, menus, and dialogs must:

- Trap focus while open
- Close on Escape (unless explicitly blocked, e.g. loading)
- Restore focus to the trigger
- Expose accessible names (`DialogTitle`, `aria-label`)

## Charts

Provide a text `summary` / `aria-label` describing the insight. Decorative
SVG chrome stays `aria-hidden` where appropriate.

## Tooling

- Storybook **Accessibility** addon (`@storybook/addon-a11y`)
- Unit tests with `jest-axe` where interactions matter
- Manual keyboard pass in dark and light themes

## Deep dive

[08-accessibility.md](./08-accessibility.md).
