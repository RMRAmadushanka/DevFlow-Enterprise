"use client";

import * as React from "react";
import { Bold, Code, Columns2, Eye, Heading2, Italic, Link2, List, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { FormField, FormLabel, FormErrorMessage, FormHint } from "@/components/forms/form-layout";
import { useControllableState, useFieldId } from "@/components/forms/shared/hooks";
import { markdownToHtml } from "./markdown-to-html";
import type { MarkdownEditorMode, MarkdownEditorProps } from "./types";

interface ToolbarAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  apply: (selected: string) => { text: string; cursorOffset: number };
}

const actions: ToolbarAction[] = [
  { label: "Bold", icon: Bold, apply: (s) => ({ text: `**${s || "bold text"}**`, cursorOffset: 2 }) },
  { label: "Italic", icon: Italic, apply: (s) => ({ text: `_${s || "italic text"}_`, cursorOffset: 1 }) },
  { label: "Heading", icon: Heading2, apply: (s) => ({ text: `## ${s || "Heading"}`, cursorOffset: 3 }) },
  { label: "Link", icon: Link2, apply: (s) => ({ text: `[${s || "text"}](url)`, cursorOffset: 1 }) },
  { label: "List item", icon: List, apply: (s) => ({ text: `- ${s || "List item"}`, cursorOffset: 2 }) },
  { label: "Code", icon: Code, apply: (s) => ({ text: s.includes("\n") ? `\`\`\`\n${s}\n\`\`\`` : `\`${s || "code"}\``, cursorOffset: 1 }) },
];

const modes: { value: MarkdownEditorMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "edit", label: "Edit", icon: Pencil },
  { value: "preview", label: "Preview", icon: Eye },
  { value: "split", label: "Split", icon: Columns2 },
];

/** Plain-`<textarea>` Markdown editor with a syntax-inserting toolbar and Edit/Preview/Split modes, rendered through the dependency-free `markdownToHtml`. */
function MarkdownEditor({
  label,
  required,
  disabled,
  error,
  helperText,
  className,
  id,
  name,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Write some markdown…",
  minHeight = 240,
  defaultMode = "edit",
}: MarkdownEditorProps) {
  const controlId = useFieldId(id);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = React.useState<MarkdownEditorMode>(defaultMode);

  const [markdown, setMarkdown] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  function applyAction(action: ToolbarAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = markdown.slice(selectionStart, selectionEnd);
    const { text, cursorOffset } = action.apply(selected);
    const next = markdown.slice(0, selectionStart) + text + markdown.slice(selectionEnd);
    setMarkdown(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const caret = selectionStart + cursorOffset;
      textarea.setSelectionRange(caret, caret + (selected.length || 0));
    });
  }

  const showEditor = mode === "edit" || mode === "split";
  const showPreview = mode === "preview" || mode === "split";

  return (
    <FormField invalid={!!error} disabled={disabled} className={cn("gap-1.5", className)}>
      {label ? (
        <FormLabel htmlFor={controlId} required={required}>
          {label}
        </FormLabel>
      ) : null}

      <div
        className={cn(
          "overflow-hidden rounded-lg border border-input transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          disabled && "pointer-events-none opacity-50"
        )}
        aria-invalid={!!error}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 p-1">
          <div role="toolbar" aria-label="Markdown formatting" className="flex items-center gap-0.5">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                aria-label={action.label}
                title={action.label}
                disabled={disabled || mode === "preview"}
                onClick={() => applyAction(action)}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <action.icon className="size-3.5" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 rounded-md border border-input bg-background p-0.5">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                aria-label={m.label}
                title={m.label}
                onClick={() => setMode(m.value)}
                className={cn(
                  "flex size-6 items-center justify-center rounded-[calc(var(--radius-md)-3px)] text-muted-foreground transition-colors hover:text-foreground",
                  mode === m.value && "bg-muted text-foreground"
                )}
              >
                <m.icon className="size-3.5" />
              </button>
            ))}
          </div>
        </div>

        <div className={cn("grid", mode === "split" && "grid-cols-2 divide-x divide-border")}>
          {showEditor ? (
            <textarea
              ref={textareaRef}
              id={controlId}
              name={name}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              style={{ minHeight }}
              className="w-full resize-y bg-transparent px-3 py-2.5 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground placeholder:font-sans"
            />
          ) : null}
          {showPreview ? (
            <div
              style={{ minHeight }}
              className="w-full overflow-auto px-3 py-2.5 text-sm text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_hr]:border-border [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-5"
              // Rendering our own constrained Markdown→HTML output, not arbitrary/remote HTML.
              dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) || `<p class="text-muted-foreground">Nothing to preview yet.</p>` }}
            />
          ) : null}
        </div>
      </div>

      {error ? <FormErrorMessage>{error}</FormErrorMessage> : helperText ? <FormHint>{helperText}</FormHint> : null}
    </FormField>
  );
}

export { MarkdownEditor };
