"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SIDEBAR_DRAWER_WIDTH } from "@/components/layout/sidebar/constants";
import { staggerContainer, staggerItem } from "@/design-system/motion/variants";

export interface MobileSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Off-canvas sidebar for mobile (<768px). Built on the `Sheet` primitive
 * (Base UI Dialog) for accessible, correct focus-trapping, Escape-to-close,
 * and a left-slide-in transition out of the box — see
 * docs/components/layout.md for why the open/close transition is CSS
 * (via Base UI) while Framer Motion drives the content reveal inside.
 */
export function MobileSidebarDrawer({ open, onClose, children }: MobileSidebarDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="left"
        style={{ width: SIDEBAR_DRAWER_WIDTH, maxWidth: SIDEBAR_DRAWER_WIDTH }}
        className="gap-0 p-0"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex h-full flex-col"
        >
          <motion.div variants={staggerItem} className="flex min-h-0 flex-1 flex-col">
            {children}
          </motion.div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
