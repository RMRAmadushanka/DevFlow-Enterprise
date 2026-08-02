/**
 * Icon sizing — Lucide React icons. Always pass `size` explicitly (never
 * rely on the 24px default) so icon sizing stays consistent with the
 * surrounding text/control size.
 *
 * Usage:
 *   import { Settings } from "lucide-react";
 *   import { iconSize } from "@/design-system/tokens/icons";
 *   <Settings size={iconSize.md} />
 */

export const iconSize = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const iconSizeUsage: Record<keyof typeof iconSize, string> = {
  xs: "Inline with caption/small text, dense table cells",
  sm: "Inline with body text, form inputs, compact buttons",
  md: "Default — buttons, nav items, list rows",
  lg: "Section headers, empty states, standalone action icons",
  xl: "Feature/empty-state illustrations, onboarding",
};

/** Tailwind class helper: `size-4`, `size-4.5`, `size-5`, `size-6`, `size-8` */
export const iconSizeClassName: Record<keyof typeof iconSize, string> = {
  xs: "size-4",
  sm: "size-[18px]",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
};

export type IconSizeToken = keyof typeof iconSize;
