import { formatDistanceToNowStrict } from "date-fns";

/** `1536` → `"1.5 KB"`. Used by `FileCard`/`FilePreview` and any byte-count column. */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

/** `1234567` → `"1.2M"`. Used by `StatCard` and table cell renderers for large counts. */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

/** `12.5` → `"+12.5%"` / `"-12.5%"`. Used by `StatCard`'s change indicator. */
export function formatChange(value: number, options?: { showSign?: boolean }): string {
  const showSign = options?.showSign ?? true;
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

/** `new Date(...)` → `"5 minutes ago"`. Used by `ActivityTimeline` and any "last updated" copy. */
export function formatRelativeTime(date: Date | string | number): string {
  const value = typeof date === "object" ? date : new Date(date);
  return `${formatDistanceToNowStrict(value)} ago`;
}

/** `(1, 20, 500)` → `"Showing 1-20 of 500"`. Used by `Pagination`. */
export function formatRangeSummary(from: number, to: number, total: number, noun?: string): string {
  if (total === 0) return noun ? `No ${noun}` : "No results";
  return noun ? `Showing ${from}-${to} of ${total} ${noun}` : `Showing ${from}-${to} of ${total}`;
}
