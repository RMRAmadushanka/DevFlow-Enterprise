# Responsive Behavior

DevFlow is desktop-strong and mobile-capable. Layouts must not break on
narrow viewports.

## Breakpoint mindset

| Tier | Intent |
|------|--------|
| Mobile | Single column, full-bleed overlays, bottom drawers |
| Tablet | Reduced grid columns |
| Desktop | Full shell + multi-column content |

## Rules

- Prefer CSS grid/flex + Tailwind breakpoints over JS layout when possible
- Use `useIsMobile` / `useMediaQuery` only when choosing *which component* to render
- Tables may collapse to cards on small screens
- Touch targets stay comfortable (≥ 32–40px interactive height)

## Page templates

List / detail / settings / dashboard templates already encode responsive
structure — compose them instead of inventing page chrome.

## Deep dive

[09-responsive-rules.md](./09-responsive-rules.md).
