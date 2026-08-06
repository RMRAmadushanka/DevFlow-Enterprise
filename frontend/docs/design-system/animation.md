# Animation

Motion should clarify hierarchy and presence — never decorate for its own sake.

## Principles

- Prefer short, subtle transitions (fade, small translate, soft scale)
- Overlays: fade + scale (modals), slide (drawers/toasts)
- Menus: light scale; tooltips: fade
- Disable or shorten non-essential motion under `prefers-reduced-motion`

## Implementation

- Framer Motion for intentional presence
- Tokens: `src/design-system/tokens/motion.ts`
- Variants: `src/design-system/motion/variants.ts`

## Anti-patterns

- Long springy bounce on enterprise chrome
- Parallel competing animations in one viewport
- Animating layout thrash on large tables

## Deep dive

[10-motion-guidelines.md](./10-motion-guidelines.md).
