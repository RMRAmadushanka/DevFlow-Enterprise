# Coding Standards

Standards for a large engineering team shipping DevFlow Enterprise.

## Component governance

Before creating a new component, answer:

1. **Does this already exist?** Search `components/ui`, product libraries, Storybook.
2. **Can it be reused / composed?** Prefer composition over forks.
3. **Is it feature-specific?** → `src/features/<domain>/components`
4. **Does it belong in the design system?** Shared across ≥2 domains → product library / `ui`

### Merge checklist (components)

```
[ ] Component documented (docs + JSDoc)
[ ] Storybook story added (`*.stories.tsx`)
[ ] Unit tests added
[ ] Responsive checked (mobile + desktop)
[ ] Accessibility checked (keyboard + a11y panel)
[ ] Dark mode + light mode checked
```

## Naming

### Components — PascalCase

Good: `ProjectCard`, `UserAvatar`, `DataTable`  
Bad: `project_card`, `myButton`

### Files

| Kind | Pattern |
|------|---------|
| Component | `button.tsx` / `metric-card.tsx` (kebab in folders; match repo) |
| Test | `button.test.tsx` / `__tests__/…` |
| Story | `button.stories.tsx` |
| Hook | `use-projects.ts` or `useProjects.ts` (feature hooks) |
| Types | `project.types.ts` |
| Service | `project.service.ts` |
| Schema | `project.schema.ts` |

> Repo convention: shared libraries use **kebab-case** filenames (`metric-card.tsx`).
> Feature template follows the same style. Stay consistent within a folder.

## TypeScript

- `strict` mode is required
- **No `any`** — use `unknown` + narrowing
- Prefer explicit interfaces / discriminated unions for props
- Share cross-cutting types from `src/types` or feature `types/`
- Props must be type-safe; avoid loose index signatures on public APIs

```ts
// Good
interface ButtonProps {
  variant: "primary" | "secondary";
}

// Bad
function Button(props: any) {}
```

## CSS / Tailwind

- Use Tailwind utilities and semantic tokens
- Avoid inline styles except for measured layout (e.g. virtualizer height)
- Avoid magic numbers — use spacing scale / CSS variables
- No duplicated one-off CSS modules for shared chrome
- Never hardcode brand hex in features

## Imports

- Pages import feature barrels + page templates
- Features import shared components — not other features’ internals
- Do not deep-import `design-system` token files for classNames (use Tailwind)

## Client vs server

- Add `"use client"` only when required (hooks, events, browser APIs)
- Keep page files thin composition layers

## Related

- [Git workflow](./git-workflow.md)
- [Testing](./testing.md)
- [Review process](./review-process.md)
