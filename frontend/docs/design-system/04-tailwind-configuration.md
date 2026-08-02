# 4. Tailwind Configuration Recommendation

## Recommendation: CSS-first (Tailwind v4), no `tailwind.config.ts`

This project uses **Tailwind CSS v4**, which replaces the JS
`tailwind.config.ts` file with an `@theme` block directly in CSS. This is
the officially recommended approach going forward, and it's the right
call for this design system for three reasons:

1. **Tokens and their Tailwind utilities live in one file.** There's no
   context-switching between a CSS file (raw values) and a JS config
   (utility mapping) — `globals.css` is both.
2. **Theme-reactive values are correctly expressed.** `@theme inline`
   lets a utility like `bg-primary` reference a CSS variable (`--primary`)
   that changes value under `.dark` — something a static JS config cannot
   express as cleanly (v3 required a plugin or arbitrary-value escape
   hatch for this).
3. **Fewer moving parts.** No `content` glob to maintain, no
   `darkMode: "class"` setting to remember to set — v4's automatic content
   detection and the `@custom-variant dark` directive replace both.

There is **no `tailwind.config.ts` in this repo** (`components.json` has
`"tailwind": { "config": "" }`) — `src/app/globals.css` is the single
configuration surface. If a future need arises for something that's
awkward to express in CSS (e.g. a complex plugin, or programmatic theme
generation), Tailwind v4 still supports a JS config loaded via
`@config "../../tailwind.config.ts";` inside the CSS — add one only when a
concrete need appears, don't add it speculatively.

## What's configured

All under `@theme` / `@theme inline` in
[`src/app/globals.css`](../../src/app/globals.css):

| Namespace | Purpose | Example utility |
|---|---|---|
| `--color-*` | Semantic color tokens (theme-reactive) | `bg-primary`, `text-danger` |
| `--font-*` | Font families | `font-sans`, `font-mono` |
| `--text-*` | Semantic typography scale | `text-display`, `text-body` |
| `--radius-*` | Border radius scale (derived from `--radius`) | `rounded-md`, `rounded-lg` |
| `--shadow-*` | Elevation scale | `shadow-modal`, `shadow-dropdown` |
| `--breakpoint-*` | Responsive breakpoints (+ `3xl`) | `lg:flex`, `3xl:px-20` |
| `--ease-*` | Motion easing curves | used via CSS `transition-timing-function: var(--ease-standard)` |

## Equivalent JS-config mental model

For teams more comfortable thinking in the old `tailwind.config.js`
shape, the CSS above is equivalent to:

```ts
// Conceptual equivalent — NOT an actual file in this repo
export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        primary: { DEFAULT: "var(--primary)", hover: "var(--primary-hover)" },
        danger: "var(--danger)",
        // …all other semantic tokens
      },
      fontFamily: { sans: ["var(--font-sans)"], mono: ["var(--font-mono)"] },
      fontSize: {
        display: ["3rem", { lineHeight: "3.5rem", fontWeight: "700" }],
        body: ["0.875rem", { lineHeight: "1.375rem" }],
        // …
      },
      borderRadius: { sm: "6px", md: "8px", lg: "12px", xl: "16px" },
      boxShadow: { modal: "…", dropdown: "…" },
      screens: { "3xl": "1440px" },
    },
  },
  plugins: [],
};
```

## Plugins in use

- `tw-animate-css` — animation utility classes (`animate-in`, `fade-in-0`,
  `zoom-in-95`, …) used by shadcn/ui primitives for enter/exit states.
- No other Tailwind plugins are required by the design system itself.

## Conventions for extending the config

- Add new **semantic** tokens (e.g. a new status color) to both `:root`
  and `.dark` in `globals.css`, then add the `--color-*` mapping in
  `@theme inline`. Never add a one-off color directly to a component.
- Prefer extending an existing namespace (`--text-*`, `--shadow-*`) over
  inventing a new one.
- If you add a token, add it to the TypeScript mirror in
  `src/design-system/tokens/` and to the tables in
  [Design Tokens](./02-design-tokens.md) in the same change.
