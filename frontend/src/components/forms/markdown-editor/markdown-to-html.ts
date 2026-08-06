/**
 * A small, dependency-free Markdown → HTML renderer for `MarkdownEditor`'s
 * preview pane. Supports the common subset (headings, emphasis, links,
 * inline/fenced code, lists, blockquotes, rules) — not full CommonMark.
 * Swap in `remark`/`marked` here if the app later needs full compliance.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (_m, a, b) => `<strong>${a ?? b}</strong>`)
    .replace(/\*([^*]+)\*|_([^_]+)_/g, (_m, a, b) => `<em>${a ?? b}</em>`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

export function markdownToHtml(markdown: string): string {
  const codeBlocks: string[] = [];
  const withoutFences = markdown.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    codeBlocks.push(`<pre><code>${escapeHtml(code.trimEnd())}</code></pre>`);
    return `\u0000CODE_BLOCK_${codeBlocks.length - 1}\u0000`;
  });

  const lines = withoutFences.split("\n");
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let paragraph: string[] = [];

  function closeList() {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  }

  function flushParagraph() {
    if (paragraph.length) {
      html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    const orderedMatch = /^\s*\d+\.\s+(.*)$/.exec(line);
    const unorderedMatch = /^\s*[-*]\s+(.*)$/.exec(line);
    const quoteMatch = /^>\s?(.*)$/.exec(line);

    if (/^\u0000CODE_BLOCK_\d+\u0000$/.test(line.trim())) {
      flushParagraph();
      closeList();
      const index = Number(line.trim().replace(/\D/g, ""));
      html.push(codeBlocks[index]);
    } else if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushParagraph();
      closeList();
      html.push("<hr />");
    } else if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
    } else if (quoteMatch) {
      flushParagraph();
      closeList();
      html.push(`<blockquote>${renderInline(quoteMatch[1])}</blockquote>`);
    } else if (orderedMatch) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${renderInline(orderedMatch[1])}</li>`);
    } else if (unorderedMatch) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${renderInline(unorderedMatch[1])}</li>`);
    } else if (line.trim() === "") {
      flushParagraph();
      closeList();
    } else {
      paragraph.push(line.trim());
    }
  }

  flushParagraph();
  closeList();

  return html.join("\n");
}
