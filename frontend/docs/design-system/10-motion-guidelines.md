# 10. Motion Guidelines

Library: **Framer Motion**. Variant source of truth:
[`src/design-system/motion/variants.ts`](../../src/design-system/motion/variants.ts).
Duration/easing tokens: [`src/design-system/tokens/motion.ts`](../../src/design-system/tokens/motion.ts)
(mirrors the `--ease-*` CSS variables in `globals.css`).

## Principle: motion is subtle and purposeful

- Max translation: **8px**. Max scale delta: **~4%**.
- Max duration: **400ms** for any single transition (page transitions use
  the top end of that range; hover/press use the bottom end).
- No bounce/elastic/spring overshoot — every curve is a `cubic-bezier`
  that **decelerates into rest**, never overshoots.
- Motion communicates a state change (opened, closed, loading, focused) —
  it never exists purely for delight/decoration.

## Duration scale

| Token | Value | Usage |
|---|---|---|
| `instant` | 100ms | Button press feedback |
| `fast` | 150ms | Tooltip/dropdown exit, small state flips |
| `base` | 200ms | Default — hover, most enter/exit transitions |
| `moderate` | 300ms | Modal/drawer/page content settle |
| `slow` | 400ms | Page transitions |
| `slower` | 600ms | Reserved — avoid unless justified |

## Easing curves

| Token | Curve | Usage |
|---|---|---|
| `standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default for most transitions |
| `emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | Enter transitions that should feel confident (modals, drawers, page) |
| `decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the screen (dropdowns, tooltips, accordion expand) |
| `accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving the screen (fast exits) |

**Rule of thumb**: entering = decelerate/emphasized (arrive and settle),
exiting = accelerate (leave quickly, don't linger).

## Pattern reference

| Interaction | Variant export | Behavior |
|---|---|---|
| Hover (card/row) | `hoverLift` | `y: 0 → -2px`, 200ms standard |
| Hover (icon/avatar) | `hoverScale` | `scale: 1 → 1.03`, 200ms standard |
| Button press | `buttonPress` | `scale: 1 → 0.97`, 100ms standard |
| Page transition | `pageTransition` | fade + 8px rise in, fade + 8px rise out |
| Modal overlay | `modalOverlay` | fade 0 → 1, 200ms |
| Modal content | `modalContent` | scale 0.96→1 + fade + 8px rise, emphasized in / accelerate out |
| Drawer / Sheet | `drawerContent(side)` | slides in from the given edge, 24px travel |
| Accordion | `accordionContent` | height 0 → auto + fade |
| Tooltip | `tooltipContent` | scale 0.96→1 + fade + 4px, fast |
| Dropdown / Menu / Popover / Combobox | `dropdownContent` | scale 0.98→1 + fade + 4px, fast |
| Toast | `toastContent` | slide + fade + scale, emphasized in |
| Loading skeleton | `skeletonPulse` | opacity pulse 0.5↔1, 1.5s, infinite |
| List reveal | `staggerContainer` + `staggerItem` | 40ms stagger per item, 6px rise + fade |

## Usage example

```tsx
import { motion } from "framer-motion";
import { hoverLift, buttonPress } from "@/design-system/motion/variants";

<motion.div variants={hoverLift} initial="rest" whileHover="hover">
  <motion.button variants={buttonPress} initial="rest" whileTap="pressed">
    Deploy
  </motion.button>
</motion.div>
```

For modals/drawers, drive the `animate`/`exit` variants directly off the
open state using `AnimatePresence`:

```tsx
<AnimatePresence>
  {open && (
    <motion.div variants={modalOverlay} initial="initial" animate="animate" exit="exit" />
  )}
</AnimatePresence>
```

## Reduced motion

Always check `useReducedMotion()` (from `framer-motion`) or wrap variants
with `withReducedMotion()` before animating anything users could
perceive as motion-sickness-inducing (large-area transforms, anything
with `repeat: Infinity`):

```tsx
import { useReducedMotion } from "framer-motion";
import { skeletonPulse, withReducedMotion } from "@/design-system/motion/variants";

const reduce = useReducedMotion();
<motion.div variants={reduce ? withReducedMotion(skeletonPulse) : skeletonPulse} animate="animate" />
```

## What NOT to do

- Don't hand-roll a new `cubic-bezier` per component — pick one of the
  four `easing` tokens.
- Don't animate `width`/`height` of layout-critical elements without
  `layout` mode or explicit `height: "auto"` handling (causes jank) —
  see how `accordionContent` is structured.
- Don't chain more than 2 sequential animations for a single interaction
  — if it needs a 3-step choreography, reconsider the interaction design.
- Don't use motion to mask slow data loading — use `skeletonPulse` states
  instead of animating placeholder content in from off-screen.
