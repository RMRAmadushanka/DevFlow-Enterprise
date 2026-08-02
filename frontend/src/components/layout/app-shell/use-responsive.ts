"use client";

import * as React from "react";

/**
 * Layout responsive tiers — distinct from the design system's Tailwind
 * breakpoints (`sm`/`md`/`lg`/…). These three tiers are what the
 * application shell itself reasons about:
 *
 *   - mobile:  < 768px   — sidebar becomes an off-canvas drawer
 *   - tablet:  768–1279px — sidebar is collapsed by default, expandable
 *   - desktop: >= 1280px — sidebar is fixed, expanded by default
 */
export type LayoutBreakpoint = "mobile" | "tablet" | "desktop";

const TABLET_MIN_WIDTH = 768;
const DESKTOP_MIN_WIDTH = 1280;

function resolveBreakpoint(width: number): LayoutBreakpoint {
  if (width >= DESKTOP_MIN_WIDTH) return "desktop";
  if (width >= TABLET_MIN_WIDTH) return "tablet";
  return "mobile";
}

/**
 * Tracks the current layout breakpoint via `matchMedia`, SSR-safe
 * (defaults to "desktop" on the server to avoid a mobile-first flash on
 * enterprise/desktop-heavy usage, then corrects on mount).
 */
export function useResponsiveBreakpoint(): LayoutBreakpoint {
  const [breakpoint, setBreakpoint] = React.useState<LayoutBreakpoint>("desktop");

  React.useEffect(() => {
    const tabletQuery = window.matchMedia(`(min-width: ${TABLET_MIN_WIDTH}px)`);
    const desktopQuery = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);

    const update = () => {
      const width = window.innerWidth;
      setBreakpoint(resolveBreakpoint(width));
    };

    update();
    tabletQuery.addEventListener("change", update);
    desktopQuery.addEventListener("change", update);

    return () => {
      tabletQuery.removeEventListener("change", update);
      desktopQuery.removeEventListener("change", update);
    };
  }, []);

  return breakpoint;
}
