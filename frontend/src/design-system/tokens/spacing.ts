/**
 * Spacing scale — 4px/8pt grid. These values already correspond 1:1 to
 * Tailwind's default spacing scale (each Tailwind step = 4px), so no
 * Tailwind override is required. This table exists purely as a documented,
 * named reference and for use in non-Tailwind contexts (inline styles,
 * Framer Motion offsets, canvas/SVG layout math).
 *
 * Usage: prefer the Tailwind utility class (e.g. `gap-4`, `p-6`, `mt-8`)
 * over reading this object directly.
 */

export const spacing = {
  0: { px: 0, tw: "0" },
  0.5: { px: 2, tw: "0.5" },
  1: { px: 4, tw: "1" },
  2: { px: 8, tw: "2" },
  3: { px: 12, tw: "3" },
  4: { px: 16, tw: "4" },
  5: { px: 20, tw: "5" },
  6: { px: 24, tw: "6" },
  8: { px: 32, tw: "8" },
  10: { px: 40, tw: "10" },
  12: { px: 48, tw: "12" },
  14: { px: 56, tw: "14" },
  16: { px: 64, tw: "16" },
  20: { px: 80, tw: "20" },
  24: { px: 96, tw: "24" },
  32: { px: 128, tw: "32" },
} as const;

/** Named aliases for the values called out in the design brief. */
export const spacingAliases = {
  xxs: spacing[0.5].px, // 2px  — icon-to-label micro gaps
  xs: spacing[1].px, // 4px  — tight inline gaps
  sm: spacing[2].px, // 8px  — compact control padding
  smMd: spacing[3].px, // 12px — form field internal padding
  md: spacing[4].px, // 16px — default component padding
  mdLg: spacing[5].px, // 20px — card padding (compact)
  lg: spacing[6].px, // 24px — card padding, section gaps
  xl: spacing[8].px, // 32px — section padding
  xxl: spacing[10].px, // 40px — large section gaps
  xxxl: spacing[12].px, // 48px — page-level vertical rhythm
  section: spacing[14].px, // 56px — major section breaks
  block: spacing[16].px, // 64px — page block spacing
  panel: spacing[20].px, // 80px — hero/empty-state padding
  page: spacing[24].px, // 96px — top-level page gutters (large screens)
  layout: spacing[32].px, // 128px — max page-level whitespace
} as const;

export type SpacingStep = keyof typeof spacing;
