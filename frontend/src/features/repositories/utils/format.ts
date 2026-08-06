export function shortSha(sha: string, length = 7): string {
  return sha.slice(0, length);
}

export function formatRepoSize(sizeKb: number): string {
  if (sizeKb < 1024) return `${sizeKb} KB`;
  const mb = sizeKb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function formatRelativeCommitDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function parseRemoteName(url: string): string {
  try {
    const cleaned = url.replace(/\.git$/, "");
    const parts = cleaned.split("/");
    return parts[parts.length - 1] || "repository";
  } catch {
    return "repository";
  }
}
