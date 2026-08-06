/** `"Ada Lovelace"` → `"AL"`, `"Ada"` → `"A"`. Used as the `Avatar` fallback whenever no image is available. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/** Stable string hash → one of the palette classes, so a given name always gets the same fallback color. */
const fallbackPalette = [
  "bg-primary-muted text-primary",
  "bg-info/15 text-info",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
  "bg-danger/15 text-danger",
];

export function getFallbackColorClassName(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return fallbackPalette[Math.abs(hash) % fallbackPalette.length]!;
}
