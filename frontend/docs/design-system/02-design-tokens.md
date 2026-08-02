# 2. Complete Design Tokens

Source of truth: [`src/app/globals.css`](../../src/app/globals.css) (CSS
variables + Tailwind `@theme`) mirrored in
[`src/design-system/tokens/`](../../src/design-system/tokens/) (TypeScript,
for non-Tailwind contexts).

## 2.1 Color tokens

Every color is semantic — named for its **purpose**, not its hue. Each row
below has both a light and dark value; components should never reference
the value column directly, only the token name via a Tailwind class
(`bg-surface`, `text-text-secondary`, …).

### Surfaces

| Token | Tailwind class | Light | Dark | Usage |
|---|---|---|---|---|
| `background` | `bg-background` | `#ffffff` | `#08090b` | App shell base |
| `surface` | `bg-surface` | `#f7f8fa` | `#0f1013` | Sunken panels, muted zones |
| `card` | `bg-card` | `#ffffff` | `#131418` | Cards, panels |
| `elevated` | `bg-elevated` | `#ffffff` | `#191a1f` | Popovers, dropdowns, dialogs |
| `sidebar` | `bg-sidebar` | `#fafafb` | `#0b0c0f` | Primary navigation rail |

### Borders & dividers

| Token | Tailwind class | Light | Dark | Usage |
|---|---|---|---|---|
| `border` | `border-border` | `#e5e7eb` | `#212227` | Component borders |
| `divider` | `border-divider` | `#edeef1` | `#1a1b1f` | Internal separators (lighter than border) |
| `input` | `border-input` | `#d9dbe1` | `#26272e` | Form control borders |
| `ring` / `focus-ring` | `ring-ring` | `#4f46e5` | `#6366f1` | Focus outline |

### Primary (brand)

| Token | Tailwind class | Light | Dark | Usage |
|---|---|---|---|---|
| `primary` | `bg-primary` | `#4f46e5` | `#6366f1` | Primary actions |
| `primary-hover` | `bg-primary-hover` | `#4338ca` | `#7678f5` | Hover state |
| `primary-active` | `bg-primary-active` | `#3730a3` | `#4f52d6` | Pressed state |
| `primary-muted` | `bg-primary-muted` | `#eef0fd` | `#1a1b2e` | Tinted backgrounds (selected rows) |
| `primary-foreground` | `text-primary-foreground` | `#ffffff` | `#ffffff` | Text/icons on primary |

### Secondary & accent

| Token | Tailwind class | Light | Dark | Usage |
|---|---|---|---|---|
| `secondary` | `bg-secondary` | `#f1f2f5` | `#1c1d23` | Secondary buttons/surfaces |
| `secondary-hover` | `bg-secondary-hover` | `#e5e7eb` | `#26272e` | Hover state |
| `accent` | `bg-accent` | `#f1f2f5` | `#1c1d23` | Menu/list hover backgrounds |

### Status

| Token | Tailwind class | Light | Dark | Usage |
|---|---|---|---|---|
| `success` | `text-success` / `bg-success` | `#16a34a` | `#22c55e` | Positive state |
| `warning` | `text-warning` / `bg-warning` | `#b45309` | `#f59e0b` | Caution state |
| `danger` (`destructive`) | `text-danger` / `bg-danger` | `#dc2626` | `#f04747` | Errors, destructive actions |
| `info` | `text-info` / `bg-info` | `#2563eb` | `#3b82f6` | Neutral/informational state |

Each status color has a paired `-foreground` (text on solid fill) — used
sparingly, and a `-muted`/`/10` tint (used for badges, banners).

### Text

| Token | Tailwind class | Light | Dark | Usage |
|---|---|---|---|---|
| `text-primary` (also `foreground`) | `text-text-primary` / `text-foreground` | `#12141a` | `#f5f6f7` | Primary reading text |
| `text-secondary` | `text-text-secondary` | `#4b4f58` | `#a1a5ad` | Supporting text, captions |
| `text-muted` | `text-text-muted` | `#8a8f98` | `#6b7078` | De-emphasized text, placeholders |

### Interactive states

| Token | Tailwind class | Light | Dark | Usage |
|---|---|---|---|---|
| `disabled` | `text-disabled` / `bg-disabled` | `#c6c9d1` | `#35363c` | Disabled control fill |
| `disabled-foreground` | `text-disabled-foreground` | `#9a9ea6` | `#5c5f66` | Disabled control text |
| `link` | `text-link` | `#4f46e5` | `#818cf8` | Inline links |
| `link-hover` | `hover:text-link-hover` | `#4338ca` | `#a5b4fc` | Link hover |
| `selection` | `::selection` (automatic) | `indigo @ 16%` | `indigo @ 30%` | Text selection background |

### Data visualization

`chart-1` … `chart-5` — a 5-step categorical palette tuned for both
themes, used by future chart components.

## 2.2 Typography scale

Base font: **Inter** (`font-sans`). Code font: **JetBrains Mono**
(`font-mono`). Base body size is **14px** (dense, data-oriented, matches
Linear/GitHub information density — not the 16px marketing-site default).

| Token | Class | Size | Line height | Weight | Tracking | Usage |
|---|---|---|---|---|---|---|
| Display | `text-display` | 48px | 56px | 700 | -0.02em | Hero numbers, empty states |
| Heading | `text-heading` | 32px | 40px | 700 | -0.015em | Page titles (H1) |
| Title | `text-title` | 24px | 32px | 600 | -0.01em | Section titles (H2) |
| Subtitle | `text-subtitle` | 18px | 28px | 600 | -0.005em | Card/panel titles (H3) |
| Body | `text-body` | 14px | 22px | 400 | 0 | Default reading text |
| Body Strong | `text-body-strong` | 14px | 22px | 600 | 0 | Emphasized body text |
| Caption | `text-caption` | 13px | 20px | 400 | 0 | Secondary/meta text |
| Small | `text-small` | 12px | 16px | 400 | 0 | Micro-copy, timestamps |
| Label | `text-label` | 13px | 20px | 500 | 0 | Form labels, table headers |
| Button | `text-button` | 14px | 20px | 500 | 0 | Button text |
| Code | `text-code` (+ `font-mono`) | 13px | 20px | 400 | 0 | Inline code, IDs, hashes |

All values are Tailwind v4 `--text-*` theme variables with paired
`--line-height` / `--letter-spacing` / `--font-weight`, so `text-display`
applies all three automatically. See
[`src/components/ui/typography.tsx`](../../src/components/ui/typography.tsx)
for the `<Text>` primitive that wraps this scale.

## 2.3 Spacing scale

A 4px/8pt grid. These map 1:1 to Tailwind's default spacing scale (each
Tailwind step = 4px) — **no override was necessary**; use the utility
classes directly.

| px | Tailwind step | Class examples | Typical usage |
|---|---|---|---|
| 2 | `0.5` | `p-0.5`, `gap-0.5` | Icon-to-label micro gaps |
| 4 | `1` | `p-1`, `gap-1` | Tight inline gaps |
| 8 | `2` | `p-2`, `gap-2` | Compact control padding |
| 12 | `3` | `p-3`, `gap-3` | Form field internal padding |
| 16 | `4` | `p-4`, `gap-4` | Default component padding |
| 20 | `5` | `p-5` | Compact card padding |
| 24 | `6` | `p-6` | Card padding, section gaps |
| 32 | `8` | `p-8` | Section padding |
| 40 | `10` | `p-10` | Large section gaps |
| 48 | `12` | `p-12` | Page-level vertical rhythm |
| 56 | `14` | `p-14` | Major section breaks |
| 64 | `16` | `p-16` | Page block spacing |
| 80 | `20` | `p-20` | Hero/empty-state padding |
| 96 | `24` | `p-24` | Top-level page gutters (large screens) |
| 128 | `32` | `p-32` | Max page-level whitespace |

Reference: [`src/design-system/tokens/spacing.ts`](../../src/design-system/tokens/spacing.ts).

## 2.4 Border radius

Derived from a single `--radius` base (`0.5rem` / 8px) so the whole scale
can be retuned in one place.

| Tier | Class | Value | Usage |
|---|---|---|---|
| Small | `rounded-sm` | 6px | Buttons (small), inputs, badges |
| Medium | `rounded-md` | 8px | Default — buttons, inputs, list rows |
| Large | `rounded-lg` | 12px | Cards, panels, dialogs |
| Extra Large | `rounded-xl` | 16px | Large cards, modals, images |
| Pill | `rounded-full` | 9999px | Pills, avatars, dots, tags |

(`rounded-xs` at 4px and `rounded-2xl` at 20px also exist for edge cases.)

## 2.5 Shadow system

Shadows are subtle and **always paired with a 1px border** on the element.

| Tier | Class | Usage |
|---|---|---|
| None | `shadow-none` | Flat elements, inline chips |
| Small | `shadow-sm` | Cards at rest |
| Medium | `shadow-md` | Raised cards, popovers at rest |
| Large | `shadow-lg` | Dragged items, floating panels |
| Overlay | `shadow-overlay` | Drawers, side panels |
| Modal | `shadow-modal` | Dialogs / modals |
| Dropdown | `shadow-dropdown` | Menus, comboboxes, context menus |

## 2.6 Iconography

Lucide React. Always pass `size` explicitly.

| Token | px | Usage |
|---|---|---|
| `xs` | 16 | Dense table cells, inline with caption text |
| `sm` | 18 | Inline with body text, compact buttons |
| `md` | 20 | Default — buttons, nav items |
| `lg` | 24 | Section headers, standalone actions |
| `xl` | 32 | Empty states, onboarding |

## 2.7 Grid & breakpoints

See [Responsive Rules](./09-responsive-rules.md) for the full grid spec
(container widths, columns, gutters, margins) and breakpoint documentation.
