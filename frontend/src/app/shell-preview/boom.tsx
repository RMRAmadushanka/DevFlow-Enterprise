"use client";

/** Throws on render when `shouldThrow` is true — used to exercise `ErrorBoundaryLayout`. */
export function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Simulated render error — this is what ErrorBoundaryLayout catches.");
  }
  return null;
}
