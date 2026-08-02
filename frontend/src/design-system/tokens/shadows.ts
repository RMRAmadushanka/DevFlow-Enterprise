/**
 * Shadow / elevation scale. Mirrors the `--shadow-*` theme variables in
 * globals.css. Shadows are intentionally subtle and paired with a thin
 * 1px border on the element itself — never rely on shadow alone to convey
 * elevation (fails in high-contrast / forced-colors modes).
 */

export const shadows = {
  none: { className: "shadow-none", usage: "Flat elements, inline chips" },
  xs: { className: "shadow-xs", usage: "Inputs, subtle resting cards" },
  sm: { className: "shadow-sm", usage: "Cards at rest, table rows on hover" },
  md: { className: "shadow-md", usage: "Raised cards, popovers at rest" },
  lg: { className: "shadow-lg", usage: "Dragged items, floating panels" },
  overlay: { className: "shadow-overlay", usage: "Drawers, side panels" },
  modal: { className: "shadow-modal", usage: "Dialogs / modals" },
  dropdown: { className: "shadow-dropdown", usage: "Dropdown menus, comboboxes, context menus" },
} as const;

export type ShadowToken = keyof typeof shadows;
