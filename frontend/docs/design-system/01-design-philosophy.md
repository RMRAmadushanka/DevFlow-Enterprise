# 1. Design Philosophy

## Positioning

DevFlow Enterprise is an Engineering Operations Platform. Its users are
engineers, EMs, and platform teams who live in the product for hours a
day. The UI has to disappear and let the data (pipelines, deployments,
incidents, metrics) lead. This is not a marketing site or a consumer app —
every decision below optimizes for **density, clarity, and trust** over
decoration.

Reference products: **Linear** (restraint, keyboard-first, typographic
hierarchy), **GitHub** (information density, neutral chrome), **Vercel**
(precision, high-contrast dark mode), **Datadog** (data-dense surfaces,
status color usage), **Notion** (calm neutrals, generous but not wasteful
spacing).

## Core principles

1. **Dark mode is the default experience, not an afterthought.**
   The product is designed dark-first (`defaultTheme="dark"`), then
   verified in light mode. Every token is defined for both from day one —
   there is no "light theme with dark mode bolted on."

2. **Semantic tokens, never raw values.**
   Components reference `bg-primary`, `text-danger`, `border-border` —
   never a hex code or an oklch value. This is what makes a 100+ page
   product retheme-able and consistent. See
   [Design Tokens](./02-design-tokens.md).

3. **Flat, not flashy.**
   No gradients, no glassmorphism, no neumorphism, no drop shadows that
   double as decoration. Elevation is communicated with a **thin 1px
   border** plus a **subtle shadow**, never one alone. This keeps the UI
   legible at high information density and avoids "trendy" visual noise
   that ages badly.

4. **Typography carries hierarchy, not color or size games.**
   A disciplined type scale (`display` → `code`) with real weight and
   letter-spacing adjustments. Most of the UI lives in `body` (14px) and
   `caption` (13px) — enterprise dashboards are read, not skimmed like a
   landing page.

5. **Motion is a whisper.**
   Every animation in this system is under 400ms, uses small translations
   (≤8px) and subtle scale (≤3%), and exists to clarify state changes
   (open/close, hover, load) — never to entertain. See
   [Motion Guidelines](./10-motion-guidelines.md).

6. **Consistency scales, cleverness doesn't.**
   With 100+ pages ahead, every one-off color, spacing value, or shadow is
   a future inconsistency. The rule: if a value isn't in the token system,
   it doesn't ship. Extending the system is preferred over overriding it.

7. **Accessible by default, not by retrofit.**
   Focus rings, contrast ratios, and reduced-motion support are built into
   the primitives themselves so every consuming page inherits them for
   free. See [Accessibility Rules](./08-accessibility.md).

## What "enterprise-grade" means here

- **Predictable**: the same control looks and behaves the same everywhere.
- **Dense but breathable**: a 4px/8pt spacing grid keeps information tight
  without feeling cramped (generous `gap`/`padding` at the section level,
  tight `gap`/`padding` inside controls).
- **Fast-feeling**: subtle, short motion; no blocking transitions.
- **Boring in the right places**: neutral chrome (surfaces, borders, text)
  so that color is reserved for meaning — primary actions and status
  (success/warning/danger/info).

## Explicit anti-goals

- No gradients.
- No glassmorphism / frosted blur as a decorative device.
- No neumorphism (soft embossed shadows).
- No saturated, decorative background colors.
- No bouncy/elastic easing curves.
- No more than one accent color family (indigo) — status colors are
  reserved strictly for status.
