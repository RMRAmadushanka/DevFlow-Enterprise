# DevFlow Enterprise — Design System Foundation

This is the documentation set for the DevFlow Enterprise Design System: a
complete, reusable UI foundation for an enterprise Engineering Operations
Platform (in the spirit of Linear, GitHub, Vercel, Datadog, and Notion).

**Scope.** This package contains only the design system foundation:
tokens, theme architecture, primitive components, and motion patterns.
It contains **no business logic, no API calls, and no application pages**
(the single `/design-system` route is a living style guide used to verify
tokens visually — not a product page).

## Contents

1. [Design Philosophy](./01-design-philosophy.md)
2. [Design Tokens](./02-design-tokens.md)
3. [Theme Architecture](./03-theme-architecture.md)
4. [Tailwind Configuration](./04-tailwind-configuration.md)
5. [CSS Variables Reference](./05-css-variables.md)
6. [Folder Structure](./06-folder-structure.md)
7. [Naming Conventions](./07-naming-conventions.md)
8. [Accessibility Rules](./08-accessibility.md)
9. [Responsive Rules](./09-responsive-rules.md)
10. [Motion Guidelines](./10-motion-guidelines.md)
11. [Usage Guide](./11-usage-guide.md)

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Component primitives | shadcn/ui (Base UI under the hood) |
| Forms | React Hook Form + Zod (infrastructure only, no forms built yet) |
| Server state | TanStack Query (provider wired, no queries defined) |
| Client/UI state | Zustand (UI-preferences slice only) |
| Icons | Lucide React |
| Motion | Framer Motion |
| Fonts | Inter (UI), JetBrains Mono (code) |

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` — it redirects to `/design-system`, the
living style guide for every token and primitive documented here.
