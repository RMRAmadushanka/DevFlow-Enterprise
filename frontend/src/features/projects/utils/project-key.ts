/** Derive an uppercase project key from a name (e.g. "API Gateway" → "API"). */
export function deriveProjectKey(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) {
    return words[0]!.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
  }
  return words
    .map((word) => word[0])
    .join("")
    .replace(/[^A-Z0-9]/gi, "")
    .slice(0, 6)
    .toUpperCase();
}
