/**
 * Typography scale — JS mirror of the `--text-*` theme variables in
 * globals.css. Base body size is 14px, tuned for dense, data-oriented
 * enterprise UI (matches Linear / GitHub / Datadog information density).
 *
 * Fonts:
 *   - UI:   Inter          (`font-sans`)
 *   - Code: JetBrains Mono (`font-mono`)
 */

export const fontFamily = {
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
} as const;

export const typeScale = {
  display: { fontSize: "48px", lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: 700, className: "text-display" },
  heading: { fontSize: "32px", lineHeight: "40px", letterSpacing: "-0.015em", fontWeight: 700, className: "text-heading" },
  title: { fontSize: "24px", lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: 600, className: "text-title" },
  subtitle: { fontSize: "18px", lineHeight: "28px", letterSpacing: "-0.005em", fontWeight: 600, className: "text-subtitle" },
  body: { fontSize: "14px", lineHeight: "22px", letterSpacing: "0", fontWeight: 400, className: "text-body" },
  bodyStrong: { fontSize: "14px", lineHeight: "22px", letterSpacing: "0", fontWeight: 600, className: "text-body-strong" },
  caption: { fontSize: "13px", lineHeight: "20px", letterSpacing: "0", fontWeight: 400, className: "text-caption" },
  small: { fontSize: "12px", lineHeight: "16px", letterSpacing: "0", fontWeight: 400, className: "text-small" },
  label: { fontSize: "13px", lineHeight: "20px", letterSpacing: "0", fontWeight: 500, className: "text-label" },
  button: { fontSize: "14px", lineHeight: "20px", letterSpacing: "0", fontWeight: 500, className: "text-button" },
  code: { fontSize: "13px", lineHeight: "20px", letterSpacing: "0", fontWeight: 400, className: "text-code font-mono" },
} as const;

export type TypeScaleToken = keyof typeof typeScale;
