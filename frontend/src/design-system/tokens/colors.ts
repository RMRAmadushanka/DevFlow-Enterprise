/**
 * Semantic color tokens — JS mirror of the CSS custom properties defined in
 * `src/app/globals.css`. Use this when a color value is needed outside of a
 * Tailwind class context (e.g. canvas/SVG drawing, chart libraries, inline
 * styles computed at runtime, or Framer Motion `animate` targets).
 *
 * DO NOT hardcode hex values in feature code. Either:
 *   1. Use the Tailwind utility (preferred): `bg-primary`, `text-danger`, …
 *   2. Read the live CSS variable: `getComputedStyle(el).getPropertyValue("--primary")`
 *   3. Reference this file for static/SSR-safe values (e.g. chart config)
 *
 * Keep this file in sync with globals.css whenever tokens change.
 */

export const lightColors = {
  background: "#ffffff",
  surface: "#f7f8fa",
  card: "#ffffff",
  cardForeground: "#12141a",
  elevated: "#ffffff",
  elevatedForeground: "#12141a",
  sidebar: "#fafafb",
  sidebarForeground: "#23262d",
  sidebarBorder: "#e7e8ec",

  border: "#e5e7eb",
  divider: "#edeef1",
  input: "#d9dbe1",
  ring: "#4f46e5",

  primary: "#4f46e5",
  primaryForeground: "#ffffff",
  primaryHover: "#4338ca",
  primaryActive: "#3730a3",
  primaryMuted: "#eef0fd",

  secondary: "#f1f2f5",
  secondaryForeground: "#12141a",
  secondaryHover: "#e5e7eb",

  accent: "#f1f2f5",
  accentForeground: "#12141a",

  muted: "#f7f8fa",
  mutedForeground: "#6b7078",

  success: "#16a34a",
  successForeground: "#ffffff",
  warning: "#b45309",
  warningForeground: "#ffffff",
  danger: "#dc2626",
  dangerForeground: "#ffffff",
  info: "#2563eb",
  infoForeground: "#ffffff",

  textPrimary: "#12141a",
  textSecondary: "#4b4f58",
  textMuted: "#8a8f98",

  disabled: "#c6c9d1",
  disabledForeground: "#9a9ea6",
  link: "#4f46e5",
  linkHover: "#4338ca",
  focusRing: "#4f46e5",

  chart1: "#4f46e5",
  chart2: "#0ea5e9",
  chart3: "#16a34a",
  chart4: "#d97706",
  chart5: "#db2777",
} as const;

export const darkColors = {
  background: "#08090b",
  surface: "#0f1013",
  card: "#131418",
  cardForeground: "#f2f3f5",
  elevated: "#191a1f",
  elevatedForeground: "#f2f3f5",
  sidebar: "#0b0c0f",
  sidebarForeground: "#e2e3e7",
  sidebarBorder: "#202127",

  border: "#212227",
  divider: "#1a1b1f",
  input: "#26272e",
  ring: "#6366f1",

  primary: "#6366f1",
  primaryForeground: "#ffffff",
  primaryHover: "#7678f5",
  primaryActive: "#4f52d6",
  primaryMuted: "#1a1b2e",

  secondary: "#1c1d23",
  secondaryForeground: "#e5e6ea",
  secondaryHover: "#26272e",

  accent: "#1c1d23",
  accentForeground: "#f2f3f5",

  muted: "#14151a",
  mutedForeground: "#9a9ea6",

  success: "#22c55e",
  successForeground: "#052e16",
  warning: "#f59e0b",
  warningForeground: "#2b1a02",
  danger: "#f04747",
  dangerForeground: "#2b0808",
  info: "#3b82f6",
  infoForeground: "#05193b",

  textPrimary: "#f5f6f7",
  textSecondary: "#a1a5ad",
  textMuted: "#6b7078",

  disabled: "#35363c",
  disabledForeground: "#5c5f66",
  link: "#818cf8",
  linkHover: "#a5b4fc",
  focusRing: "#6366f1",

  chart1: "#818cf8",
  chart2: "#38bdf8",
  chart3: "#4ade80",
  chart4: "#fbbf24",
  chart5: "#f472b6",
} as const;

export type ColorToken = keyof typeof darkColors;

export const colors = { light: lightColors, dark: darkColors } as const;
