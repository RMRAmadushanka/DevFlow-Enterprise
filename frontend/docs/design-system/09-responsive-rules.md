# 9. Responsive Rules

## Breakpoints

Tailwind v4 defaults, plus one DevFlow-specific addition (`3xl`) for the
primary desktop design width. Defined as `--breakpoint-*` in
[`globals.css`](../../src/app/globals.css#L1) and mirrored in
[`breakpoints.ts`](../../src/design-system/tokens/breakpoints.ts).

| Breakpoint | Min-width | Reference device | Notes |
|---|---|---|---|
| `xs` | 360px | Small mobile | Below `sm`; use for the tightest layouts |
| `sm` | 640px | Large mobile / small tablet portrait | |
| `md` | 768px | **Tablet** (reference breakpoint from brief) | |
| `lg` | 1024px | **Tablet landscape** (reference breakpoint from brief) | Sidebar typically becomes visible here |
| `xl` | 1280px | Laptop / small desktop | |
| `2xl` | 1536px | Large desktop | |
| `3xl` | 1440px | **Primary desktop design width** | Most dashboard layouts are designed at this width first |

Reference viewports called out explicitly in the brief:
**Desktop 1440 · Tablet 1024 · Mobile 768 · Small Mobile 390**. These map
to `3xl`/`lg`/`md`, and the sub-`sm` range respectively — `390` isn't a
breakpoint boundary itself (no layout should be *designed to change* at
exactly 390px); it's the canonical small-mobile viewport to test against
within the `< sm` range.

## Grid system

Defined in [`grid.ts`](../../src/design-system/tokens/grid.ts). These are
target values for future page-level layout — the design system doesn't
enforce a literal CSS grid, but the `<Container>` primitive
([`src/components/ui/container.tsx`](../../src/components/ui/container.tsx))
implements the max-width + margin part.

| Tier | Viewport | Max content width | Columns | Gutter | Margin |
|---|---|---|---|---|---|
| Desktop | 1440px | 1280px | 12 | 24px | 80px |
| Laptop | 1280px | 1152px | 12 | 24px | 64px |
| Tablet | 1024px | 928px | 8 | 20px | 48px |
| Mobile | 768px | 704px | 4 | 16px | 32px |
| Small mobile | 390px | 358px | 4 | 12px | 16px |

**Column count drops** (12 → 8 → 4) as viewport shrinks — this reflects
that dense multi-column dashboard layouts (e.g. a 3-up card grid) need to
collapse to 1–2 columns well before mobile, not just have their gutters
shrink.

## `<Container>` usage

```tsx
import { Container } from "@/components/ui/container";

<Container size="default" gutter="default">
  {/* page content, max-width 1440px, responsive side padding */}
</Container>
```

| `size` | Max width | Usage |
|---|---|---|
| `full` | none | Full-bleed sections (hero banners, tables that need edge-to-edge) |
| `wide` | 1536px (`2xl`) | Wide dashboards, data grids |
| `default` | 1440px (`3xl`) | Standard page content — **the default** |
| `narrow` | 1024px (`lg`) | Forms, settings pages, reading-width content |

## Responsive behavior guidelines

1. **Mobile-first authoring.** Write the base (no-prefix) class for the
   smallest viewport, then layer `sm:`/`md:`/`lg:` up — never write the
   desktop style unprefixed and override it down.
2. **Sidebar/rail navigation** collapses to an off-canvas `Sheet` drawer
   below `lg` (1024px) and becomes a persistent rail at `lg` and above.
3. **Data tables** should horizontally scroll (not squish columns) below
   `md`; consider a card-based transformation below `sm` for very
   dense tables (future page-level decision, not enforced here).
4. **Multi-column card grids** step down: `grid-cols-3` (desktop) →
   `md:grid-cols-2` → base `grid-cols-1`. Never let a card go below
   ~280px wide before wrapping to a new row.
5. **Dialogs** should never exceed `calc(100vw - 2rem)` in width (already
   the shadcn default) and should switch to a full-height `Sheet` pattern
   on small mobile when the content is long-form, rather than a scrolling
   centered dialog.
6. **Touch targets**: interactive elements should be ≥40px in their
   smallest dimension below the `md` breakpoint (buttons already default
   to `h-8`/`32px` for desktop density — bump to `size="lg"`/`h-9`+
   or add vertical padding on touch-primary layouts).
7. **Typography does not scale down by breakpoint.** The type scale is
   fixed across breakpoints (this is a data-dense desktop-first product);
   only *layout* (columns, spacing, container width) responds to viewport,
   not font size. If a future marketing/landing surface needs responsive
   type, that is out of scope for this system.

## Testing matrix

At minimum, verify every new page/component at:

- 390px (small mobile)
- 768px (tablet portrait)
- 1024px (tablet landscape / breakpoint where nav changes)
- 1440px (primary desktop)
- 1920px (spot-check for excessive whitespace — should be capped by
  `<Container>`, not stretch full-bleed)
