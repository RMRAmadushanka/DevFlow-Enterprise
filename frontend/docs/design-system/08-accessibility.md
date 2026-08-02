# 8. Accessibility Rules

Accessibility is built into the primitives, not layered on after. Base UI
(the headless engine behind shadcn/ui in this project) implements WAI-ARIA
patterns correctly out of the box (focus management, roving tabindex,
`aria-*` wiring); the rules below are what **this design system** adds or
enforces on top of that.

## Color & contrast

- Every `{role}` / `{role}-foreground` pair is chosen to meet **WCAG 2.1
  AA** (≥4.5:1 for normal text, ≥3:1 for large text ≥18px/14px-bold) in
  both themes.
- Status colors (`success`/`warning`/`danger`/`info`) are never the only
  signal — always pair with an icon or text label (see `Badge`/`Alert`
  usage in the showcase), since ~8% of men have some form of color vision
  deficiency.
- `text-muted` / `disabled` tokens are for de-emphasis, not for
  information that must be read — don't put critical content only in a
  muted color.

## Focus

- Every interactive primitive uses the shared focus treatment defined in
  `@layer base`: a 2px outline in `--focus-ring`, offset by 2px. This is a
  **visible-only-for-keyboard** style via `:focus-visible` — mouse/touch
  interaction never shows a focus ring, keyboard/switch/voice control
  always does.
- Never remove `outline` on `:focus-visible` without providing an
  equivalent replacement. Never use `outline: none` globally.
- Focus order follows visual/DOM order — don't reorder visually with
  `flex-direction: row-reverse` or CSS grid in ways that break tab order.

## Semantics

- Use the semantic HTML element the `<Text>` primitive defaults to
  (`h1`–`h3`, `p`, `span`, `code`) — only override `as` when the visual
  style and document semantics genuinely diverge (e.g. a `title`-styled
  `<span>` inside a button).
- Icon-only buttons **must** have an `aria-label` (enforced by convention,
  see `ThemeToggle`'s `aria-label="Toggle theme"` and the icon-only
  `Button size="icon"` usages in the showcase).
- Decorative icons paired with visible text should not also need a label —
  Lucide icons have no default role/label, so no extra work is needed, but
  don't add `role="img"`/`aria-label` to icons that are purely decorative.

## Motion & vestibular safety

- All Framer Motion variants stay within safe bounds: translations
  ≤8px, scale changes ≤4%, no parallax, no spin/rotation on entrance.
- Respect `prefers-reduced-motion: reduce`. Use the
  `withReducedMotion()` helper in
  [`src/design-system/motion/variants.ts`](../../src/design-system/motion/variants.ts)
  or Framer Motion's `useReducedMotion()` hook to strip transforms/duration
  when the user has requested it. The `skeletonPulse` opacity animation
  and CSS-driven `animate-in`/`fade-in` utilities from `tw-animate-css`
  should also be gated the same way in future page-level implementations.

## Forms

- Every form control primitive (`Input`, `Select`, `Checkbox`,
  `RadioGroup`, `Switch`, `Textarea`) supports `aria-invalid`, which
  triggers a built-in error treatment (`border-danger`, `ring-danger/20`)
  — wire validation state (e.g. from Zod + React Hook Form) to
  `aria-invalid`, not to a custom red border class.
- Always pair a control with a `<Label htmlFor="…">` — never rely on
  `placeholder` as a label substitute.

## Reduced transparency / forced colors

- Elevation never depends on `backdrop-blur` alone (this system avoids
  glassmorphism entirely) — surfaces use solid `background` + `border` +
  `shadow`, which remains legible under `forced-colors: active` and with
  transparency effects disabled at the OS level.

## Keyboard support (inherited from Base UI, verified per component)

| Component | Keyboard behavior |
|---|---|
| Dialog / Sheet | `Esc` closes, focus is trapped and restored to trigger on close |
| Dropdown / Select | Arrow keys navigate, `Enter`/`Space` selects, `Esc` closes, type-ahead |
| Tabs | Arrow keys move between tabs, `Home`/`End` jump to first/last |
| Accordion | `Enter`/`Space` toggles, arrow keys move focus between triggers |
| Tooltip | Appears on focus (not just hover), dismiss on `Esc` |

## Checklist for new primitives

- [ ] Meets AA contrast in both themes
- [ ] Fully operable by keyboard alone
- [ ] Has a visible focus state using `--focus-ring`
- [ ] Uses semantic HTML / correct ARIA role
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Works with `aria-invalid` if it's a form control
