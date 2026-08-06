"use client";

import * as React from "react";

const STORAGE_KEY = "devflow-form-recent-colors";
const MAX_RECENT = 8;

/** Client-only "recently used" swatch list, persisted to `localStorage` (a UI preference, not application/business data). */
export function useRecentColors() {
  const [colors, setColors] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setColors(JSON.parse(stored));
    } catch {
      // Ignore unavailable/corrupt storage — recent colors are a nice-to-have.
    }
  }, []);

  const addColor = React.useCallback((hex: string) => {
    setColors((prev) => {
      const next = [hex, ...prev.filter((c) => c.toLowerCase() !== hex.toLowerCase())].slice(0, MAX_RECENT);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore write failures (private browsing, quota, etc.).
      }
      return next;
    });
  }, []);

  return { colors, addColor };
}
