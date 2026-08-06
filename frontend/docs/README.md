# DevFlow Enterprise — Documentation Hub

Canonical docs for the design system, components, architecture, and engineering
governance. Use this index to onboard and navigate.

| Area | Start here |
|------|------------|
| Design system | [design-system/introduction.md](./design-system/introduction.md) |
| Components | [components/buttons.md](./components/buttons.md) |
| Architecture | [architecture/frontend.md](./architecture/frontend.md) |
| Engineering | [engineering/getting-started.md](./engineering/getting-started.md) |
| Storybook | Run `npm run storybook` (port 6006) |

## Stack (source of truth)

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 App Router |
| UI | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 + design tokens |
| Primitives | shadcn/ui (Base UI) |
| Docs UI | Storybook 10 (`@storybook/nextjs-vite`) |
| Unit tests | **Vitest** + React Testing Library + jest-axe |
| Lint / format | ESLint + Prettier |
| Commits | Conventional Commits |

> Testing note: the product uses **Vitest**, not Jest. Patterns and RTL APIs
> are the same; prefer `vitest` / `@testing-library/*` in new work.
