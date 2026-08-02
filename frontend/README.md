# DevFlow Enterprise — Design System & Application Layout

A complete, reusable, enterprise-grade design system **and** application
layout foundation for **DevFlow Enterprise**, an Engineering Operations
Platform in the spirit of Linear, GitHub, Vercel, and Datadog.

> **Scope note**: this repository contains only foundational UI — design
> tokens/theming/primitives, plus the reusable sidebar/navbar/shell layout
> every page is built on. There is no business logic, no API layer, and
> no application/feature pages. `/design-system` is a living style guide
> for tokens and primitives; `/shell-preview` is a harness exercising the
> full application shell with fixture data.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui ·
React Hook Form · Zod · TanStack Query · Zustand · Lucide React ·
Framer Motion · Inter + JetBrains Mono

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to
`/design-system`, the token/component showcase. See also `/shell-preview`
for the application layout system.

```bash
npm run build      # production build
npx eslint .        # lint
npx tsc --noEmit    # typecheck
npm run test         # unit tests (Vitest + RTL + jest-axe)
```

## Documentation

Design system documentation lives in
[`docs/design-system/`](./docs/design-system/00-overview.md):

1. [Design Philosophy](./docs/design-system/01-design-philosophy.md)
2. [Design Tokens](./docs/design-system/02-design-tokens.md)
3. [Theme Architecture](./docs/design-system/03-theme-architecture.md)
4. [Tailwind Configuration](./docs/design-system/04-tailwind-configuration.md)
5. [CSS Variables Reference](./docs/design-system/05-css-variables.md)
6. [Folder Structure](./docs/design-system/06-folder-structure.md)
7. [Naming Conventions](./docs/design-system/07-naming-conventions.md)
8. [Accessibility Rules](./docs/design-system/08-accessibility.md)
9. [Responsive Rules](./docs/design-system/09-responsive-rules.md)
10. [Motion Guidelines](./docs/design-system/10-motion-guidelines.md)
11. [Usage Guide](./docs/design-system/11-usage-guide.md)

Application layout system documentation:
[`docs/components/layout.md`](./docs/components/layout.md) — `AppShell`,
`Sidebar`, `WorkspaceSwitcher`, `Navbar`, `CommandMenu`, `PageHeader`,
layout states, responsive behavior, accessibility, motion, and testing.

## Key locations

| What | Where |
|---|---|
| All design tokens (CSS) | [`src/app/globals.css`](./src/app/globals.css) |
| Token TypeScript mirror | [`src/design-system/tokens/`](./src/design-system/tokens/) |
| Theme provider / toggle | [`src/design-system/theme/`](./src/design-system/theme/) |
| Motion variant library | [`src/design-system/motion/variants.ts`](./src/design-system/motion/variants.ts) |
| UI primitives | [`src/components/ui/`](./src/components/ui/) |
| Living style guide | [`src/app/design-system/page.tsx`](./src/app/design-system/page.tsx) |
| Application layout system | [`src/components/layout/`](./src/components/layout/) |
| Layout preview harness | [`src/app/shell-preview/`](./src/app/shell-preview/) |
| Component tests | co-located `*.test.tsx` under `src/components/layout/` |
