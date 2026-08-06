const WORDS_PER_MINUTE = 200;

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  const cleaned = stripHtml(text);
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function estimateReadingTimeMinutes(text: string): number {
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatDocumentDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function buildBreadcrumb(
  nodes: Array<{ id: string; title: string; parentId: string | null }>,
  documentId: string
): Array<{ id: string; title: string }> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const trail: Array<{ id: string; title: string }> = [];
  let current = byId.get(documentId);
  while (current) {
    trail.unshift({ id: current.id, title: current.title });
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return trail;
}
