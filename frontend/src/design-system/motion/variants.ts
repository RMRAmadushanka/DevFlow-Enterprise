/**
 * Framer Motion variant library — the canonical, reusable motion patterns
 * for the entire application. Import these instead of hand-writing new
 * transition curves so motion stays consistent across 100+ pages.
 *
 * Every variant is intentionally subtle: small translations (≤8px), short
 * durations (≤400ms), and standard/decelerate easing. Respects
 * `prefers-reduced-motion` via `useReducedMotionVariants` below.
 */
import type { Transition, Variants } from "framer-motion";
import { duration, easing } from "@/design-system/tokens/motion";

const standard: Transition = { duration: duration.base, ease: easing.standard };
const emphasized: Transition = { duration: duration.moderate, ease: easing.emphasized };
const decelerate: Transition = { duration: duration.base, ease: easing.decelerate };

/** Hover — subtle lift, used on cards / interactive rows */
export const hoverLift: Variants = {
  rest: { y: 0, transition: standard },
  hover: { y: -2, transition: standard },
};

/** Hover — subtle scale, used on icon buttons / avatars */
export const hoverScale: Variants = {
  rest: { scale: 1, transition: standard },
  hover: { scale: 1.03, transition: standard },
};

/** Button press — quick, tactile scale-down on click */
export const buttonPress = {
  rest: { scale: 1 },
  pressed: { scale: 0.97, transition: { duration: duration.instant, ease: easing.standard } },
} satisfies Variants;

/** Page transition — fade + rise, used by route-level wrappers */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: emphasized },
  exit: { opacity: 0, y: -8, transition: standard },
};

/** Modal / dialog — scale + fade from center */
export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: emphasized },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: duration.fast, ease: easing.accelerate } },
};

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: standard },
  exit: { opacity: 0, transition: standard },
};

/** Drawer / sheet — slides in from an edge. Pass `side` to pick axis. */
export function drawerContent(side: "left" | "right" | "top" | "bottom" = "right"): Variants {
  const sign = side === "left" || side === "top" ? -1 : 1;
  const offset = sign * 24;

  if (side === "left" || side === "right") {
    return {
      initial: { x: offset, opacity: 0.6 },
      animate: { x: 0, opacity: 1, transition: emphasized },
      exit: { x: offset, opacity: 0, transition: { duration: duration.fast, ease: easing.accelerate } },
    };
  }

  return {
    initial: { y: offset, opacity: 0.6 },
    animate: { y: 0, opacity: 1, transition: emphasized },
    exit: { y: offset, opacity: 0, transition: { duration: duration.fast, ease: easing.accelerate } },
  };
}

/** Accordion — height + fade, use with `layout` or measured height */
export const accordionContent: Variants = {
  collapsed: { height: 0, opacity: 0, transition: standard },
  expanded: { height: "auto", opacity: 1, transition: decelerate },
};

/** Tooltip — quick fade + micro-rise, no motion on exit delay */
export const tooltipContent: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.fast, ease: easing.decelerate } },
  exit: { opacity: 0, scale: 0.96, y: 4, transition: { duration: duration.instant, ease: easing.accelerate } },
};

/** Dropdown / menu / popover / combobox */
export const dropdownContent: Variants = {
  initial: { opacity: 0, scale: 0.98, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.fast, ease: easing.decelerate } },
  exit: { opacity: 0, scale: 0.98, y: -4, transition: { duration: duration.instant, ease: easing.accelerate } },
};

/** Loading skeleton — pulse shimmer (opacity based, GPU cheap) */
export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: { duration: 1.5, ease: easing.standard, repeat: Infinity },
  },
};

/** Stagger container — reveal lists of items one after another */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: standard },
};

/** Toast — slide + fade, matches `sonner` defaults but exported for custom use */
export const toastContent: Variants = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: emphasized },
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.fast, ease: easing.accelerate } },
};

/**
 * Returns variants with all motion neutralized (zero-duration / no
 * transform) for users who have `prefers-reduced-motion: reduce` set.
 * Pair with the `useReducedMotion` hook from framer-motion.
 */
export function withReducedMotion(variants: Variants): Variants {
  const reduced: Variants = {};
  for (const key of Object.keys(variants)) {
    reduced[key] = { transition: { duration: 0 } };
  }
  return reduced;
}
