/**
 * Thin wrapper around `document.execCommand` — deprecated, but still the
 * only zero-dependency way to drive basic contenteditable formatting across
 * browsers. Kept isolated here so swapping in a proper editor engine (Tiptap,
 * Lexical, …) later only means rewriting this one module.
 */
export function runCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function insertTable(rows = 3, cols = 3) {
  const cells = Array.from({ length: cols })
    .map(() => '<td style="border:1px solid var(--color-border, #e5e7eb);padding:6px 8px;min-width:60px;">&nbsp;</td>')
    .join("");
  const row = `<tr>${cells}</tr>`;
  const table = `<table style="border-collapse:collapse;width:100%;margin:8px 0;">${Array.from({ length: rows })
    .map(() => row)
    .join("")}</table><p><br></p>`;
  runCommand("insertHTML", table);
}

export function insertImagePlaceholder(url: string, alt = "Image") {
  runCommand(
    "insertHTML",
    `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`
  );
}

export function insertCodeBlock() {
  runCommand("formatBlock", "pre");
}

export function insertLink(url: string) {
  runCommand("createLink", url);
}
