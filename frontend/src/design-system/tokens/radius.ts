/**
 * Border radius scale — derived from a single `--radius` base value
 * (0.5rem / 8px) so every tier scales together if the base is retuned.
 * See the `--radius-*` definitions in globals.css.
 */

export const radius = {
  none: { px: 0, className: "rounded-none" },
  xs: { px: 4, className: "rounded-xs", usage: "Checkboxes, small chips, inline code" },
  sm: { px: 6, className: "rounded-sm", usage: "Buttons (small), inputs, badges" },
  md: { px: 8, className: "rounded-md", usage: "Buttons, inputs, list rows — the default" },
  lg: { px: 12, className: "rounded-lg", usage: "Cards, panels, dialogs" },
  xl: { px: 16, className: "rounded-xl", usage: "Large cards, modals, images" },
  "2xl": { px: 20, className: "rounded-2xl", usage: "Hero panels, large media" },
  full: { px: 9999, className: "rounded-full", usage: "Pills, avatars, dots, tags" },
} as const;

export type RadiusToken = keyof typeof radius;
