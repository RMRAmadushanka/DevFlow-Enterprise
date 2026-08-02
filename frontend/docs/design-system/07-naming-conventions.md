# 7. Naming Conventions

## Files & folders

| Type | Convention | Example |
|---|---|---|
| Component file | `kebab-case.tsx` | `dropdown-menu.tsx`, `theme-toggle.tsx` |
| Non-component module | `kebab-case.ts` | `ui-preferences-store.ts` |
| React component export | `PascalCase` | `export function ThemeToggle()` |
| Hook | `useCamelCase` | `useUIPreferencesStore`, `useTheme` |
| Folder | `kebab-case`, singular for concepts, plural for collections | `theme/`, `tokens/`, `components/` |

## Design tokens

**CSS custom properties**: `--kebab-case`, semantic (purpose), never
visual (appearance):

```css
--primary            /* ✅ semantic */
--indigo-500         /* ❌ visual — never do this */
--text-secondary      /* ✅ semantic */
--gray-400            /* ❌ visual */
```

**Tailwind utility classes**: standard Tailwind naming
(`{property}-{token}`), where `{token}` is always a semantic name:

```
bg-primary        text-danger        border-divider
shadow-dropdown   rounded-lg         text-body
```

**TypeScript token objects**: `camelCase` keys, grouped by category, one
file per category under `src/design-system/tokens/`:

```ts
export const lightColors = { primaryHover: "#4338ca", … }
export const typeScale = { bodyStrong: { … }, … }
```

## Component variants (CVA)

Variant prop names are always singular, lowercase, and describe **intent**
not appearance:

```ts
variant: "default" | "secondary" | "outline" | "ghost" | "destructive" | "success" | "warning" | "info" | "link"
size: "xs" | "sm" | "default" | "lg" | "icon"
tone: "primary" | "secondary" | "muted" | "success" | "warning" | "danger" | "info" | "link"
```

`variant` = which visual treatment; `tone` = which semantic color (used on
content-only primitives like `<Text>` where there's no "fill" to vary).

## Semantic color naming pattern

```
{role}                 e.g. primary, success, danger
{role}-{state}         e.g. primary-hover, primary-active
{role}-foreground       text/icon color guaranteed to contrast with {role}
{role}-muted            low-opacity tint of {role}, for badges/banners
```

## Component composition naming (compound components)

Follow the shadcn/Radix/Base-UI convention: `<Namespace><Part>`.

```
Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter
Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
```

## Data attributes

Every primitive sets `data-slot="component-name"` on its root DOM node
(shadcn convention) — use this for CSS targeting/testing hooks instead of
adding new classNames:

```tsx
<div data-slot="dialog-content" />
```

## Motion variant naming

Named after the **interaction**, not the animated property:
`hoverLift`, `buttonPress`, `modalContent`, `dropdownContent`,
`skeletonPulse` — see [Motion Guidelines](./10-motion-guidelines.md).

## Route naming (future, out of scope here)

Not applicable to this deliverable — no application routes exist beyond
the `/design-system` showcase.
