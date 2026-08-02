/**
 * Breakpoints — mirrors `--breakpoint-*` in globals.css (Tailwind v4
 * `@theme` namespace). `3xl` is a DevFlow-specific addition for the
 * primary desktop design width used across enterprise dashboards.
 */

export const breakpoints = {
  xs: { px: 360, tw: "xs", usage: "Small mobile (reference device width)" },
  sm: { px: 640, tw: "sm", usage: "Large mobile / small tablet portrait" },
  md: { px: 768, tw: "md", usage: "Tablet — reference breakpoint" },
  lg: { px: 1024, tw: "lg", usage: "Tablet landscape / small laptop — reference breakpoint" },
  xl: { px: 1280, tw: "xl", usage: "Laptop / small desktop" },
  "2xl": { px: 1536, tw: "2xl", usage: "Large desktop" },
  "3xl": { px: 1440, tw: "3xl", usage: "Primary desktop design width — most dashboard layouts target this" },
} as const;

/** Reference device widths called out explicitly in the design brief. */
export const referenceViewports = {
  desktop: 1440,
  tablet: 1024,
  mobile: 768,
  smallMobile: 390,
} as const;

export type BreakpointToken = keyof typeof breakpoints;
