/**
 * Grid system — container widths, column counts, gutters and margins per
 * reference viewport. These are guidelines for building future page layouts
 * (out of scope here) on top of this design system.
 */

export const grid = {
  desktop: {
    viewport: 1440,
    maxContentWidth: 1280,
    columns: 12,
    gutter: 24,
    margin: 80,
  },
  laptop: {
    viewport: 1280,
    maxContentWidth: 1152,
    columns: 12,
    gutter: 24,
    margin: 64,
  },
  tablet: {
    viewport: 1024,
    maxContentWidth: 928,
    columns: 8,
    gutter: 20,
    margin: 48,
  },
  mobile: {
    viewport: 768,
    maxContentWidth: 704,
    columns: 4,
    gutter: 16,
    margin: 32,
  },
  smallMobile: {
    viewport: 390,
    maxContentWidth: 358,
    columns: 4,
    gutter: 12,
    margin: 16,
  },
} as const;

export type GridTier = keyof typeof grid;
