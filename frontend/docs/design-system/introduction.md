# Introduction

Welcome to the **DevFlow Enterprise Design System** — the reusable UI foundation
for our engineering operations platform.

This system exists so dozens of engineers can ship consistent, accessible,
performant product UI without reinventing buttons, tables, overlays, or tokens.

## What you get

- Semantic **design tokens** (color, type, space, motion)
- Dark-first **theming** with verified light mode
- Production **component libraries** (ui, forms, data-display, feedback, navigation, dashboard)
- **Storybook** for discovery, controls, a11y, and docs
- **Architecture patterns** for features and pages

## Who this is for

| Audience | Use these docs to… |
|----------|--------------------|
| Product engineers | Compose pages from templates + features |
| Design system contributors | Extend tokens and shared components |
| Reviewers | Apply governance checklists |
| New hires | Follow [Getting Started](../engineering/getting-started.md) |

## Quick links

- [Principles](./principles.md)
- [Colors](./colors.md)
- [Typography](./typography.md)
- [Spacing](./spacing.md)
- [Accessibility](./accessibility.md)
- [Responsive](./responsive.md)
- [Animation](./animation.md)
- Deep dive (legacy numbered set): [00-overview.md](./00-overview.md)

## Non-goals

The design system and Storybook do **not** include:

- Product feature pages (Projects, Tasks, Deployments)
- Live API integrations
- Business workflows

Those belong in `src/features/*` and `src/app/(dashboard)/*` following
[Frontend Architecture](../architecture/frontend.md).
