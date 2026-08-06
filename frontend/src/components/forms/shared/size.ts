import type { FieldSize } from "./types";

/** Height + text-size classes for `<input>`-shaped controls (text/number/select/etc). */
export const fieldControlSizeClassName: Record<FieldSize, string> = {
  sm: "h-7 text-[0.8rem]",
  md: "h-8 text-base md:text-sm",
  lg: "h-9 text-sm",
};

/** Matching icon size for affixes/icons rendered inside a sized control. */
export const fieldIconSizeClassName: Record<FieldSize, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-4.5",
};
