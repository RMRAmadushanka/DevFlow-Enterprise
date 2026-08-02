/**
 * Motion tokens — durations (seconds, for Framer Motion) and easing curves.
 * Mirrors the `--ease-*` CSS variables in globals.css so CSS transitions
 * and Framer Motion animations stay visually consistent.
 *
 * Principle: motion should be fast, purposeful, and subtle. Nothing in
 * this system should animate for longer than ~400ms outside of page
 * transitions.
 */

export const duration = {
  instant: 0.1,
  fast: 0.15,
  base: 0.2,
  moderate: 0.3,
  slow: 0.4,
  slower: 0.6,
} as const;

/** Cubic-bezier easing curves — match `--ease-*` in globals.css */
export const easing = {
  standard: [0.4, 0, 0.2, 1] as const,
  emphasized: [0.16, 1, 0.3, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
};

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;
