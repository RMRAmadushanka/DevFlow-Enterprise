/**
 * Minimal CSV export helpers — no external dependency needed for the
 * row counts these exports deal with (sprint lists, single-sprint summaries).
 */

export interface CsvColumn<T> {
  key: keyof T | string;
  label: string;
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = value instanceof Date ? value.toISOString() : String(value);
  // Quote whenever the value contains a comma, quote, or newline; escape embedded quotes.
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

/** Builds a CSV string (with header row) from an array of row objects. */
export function toCsv<T extends object>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => csvCell(column.label)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((column) => csvCell((row as Record<string, unknown>)[column.key as string]))
      .join(",")
  );
  return [header, ...lines].join("\r\n");
}

/** Triggers a browser download of `csvString` as `filename`. No-op outside the browser. */
export function downloadCsv(filename: string, csvString: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
}
