# Design System Principles

Aligned with products like Linear, GitHub, Vercel, and Atlassian — optimized for
dense, trustworthy engineering tools.

## Consistency

Components must behave the same way everywhere:

- Same focus rings, hover affordances, and disabled opacity
- Same tone palette (`success` / `warning` / `danger` / `info`)
- Same density language (`comfortable` / `compact`)

If two surfaces need the same interaction, they must share a component — not a
copy-pasted class string.

## Reusability

Before adding UI:

1. Does it already exist in `components/ui` or a product library?
2. Can an existing primitive be composed?
3. Is it feature-specific? → `features/<domain>/components`
4. Is it truly shared? → design system / product library

See [Component governance](../engineering/coding-standards.md#component-governance).

## Accessibility

Every component must work for keyboard and assistive technology users.
WCAG AA is the floor. Details: [Accessibility](./accessibility.md).

## Performance

- Prefer CSS and Tailwind over runtime style calculation
- Avoid unnecessary client boundaries
- Memoize expensive chart/list surfaces when data is large
- Do not put server data in Zustand

## Scalability

The system must support 50+ pages and 100+ components:

- Feature modules own domain UI
- Page templates own layout chrome
- Tokens own visual identity
- Storybook owns discovery

## Dark-first

Dark mode is the default product experience. Every token and story must be
verified in **dark and light**.

## Flat, not flashy

No decorative gradients, glassmorphism, or 3D charts. Elevation = border +
subtle shadow. Data leads; chrome stays quiet.

Detailed philosophy: [01-design-philosophy.md](./01-design-philosophy.md).
