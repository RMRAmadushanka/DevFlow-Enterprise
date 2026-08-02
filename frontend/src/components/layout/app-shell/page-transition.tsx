"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { pageTransition, withReducedMotion } from "@/design-system/motion/variants";

/**
 * Wraps route content in a subtle fade + rise transition on navigation,
 * keyed by pathname. Honors `prefers-reduced-motion` by neutralizing the
 * transform/opacity animation entirely.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? withReducedMotion(pageTransition) : pageTransition;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
