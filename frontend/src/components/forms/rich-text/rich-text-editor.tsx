"use client";

import * as React from "react";
import {
  Bold,
  Code2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Table as TableIcon,
  Underline,
  Undo2,
  Image as ImageIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { FormField, FormLabel, FormErrorMessage, FormHint } from "@/components/forms/form-layout";
import { useFieldId } from "@/components/forms/shared/hooks";
import { insertCodeBlock, insertImagePlaceholder, insertLink, insertTable, runCommand } from "./commands";
import type { RichTextEditorProps } from "./types";

interface ToolbarAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

/**
 * A `contentEditable`-based rich text editor. Deliberately dependency-free
 * (no Tiptap/Lexical/ProseMirror, none of which are in this system's
 * declared stack) — the toolbar drives `document.execCommand`, isolated in
 * `./commands` so a real editor engine can be swapped in later without
 * touching this component's public API.
 */
function RichTextEditor({
  label,
  required,
  disabled,
  error,
  helperText,
  className,
  id,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Start writing…",
  minHeight = 160,
}: RichTextEditorProps) {
  const controlId = useFieldId(id);
  const labelId = `${controlId}-label`;
  const editorRef = React.useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;

  React.useEffect(() => {
    if (isControlled && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value ?? "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the controlled `value` itself changes
  }, [value]);

  React.useEffect(() => {
    if (!isControlled && editorRef.current) editorRef.current.innerHTML = defaultValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial mount only
  }, []);

  function emitChange() {
    onValueChange?.(editorRef.current?.innerHTML ?? "");
  }

  function withFocus(fn: () => void) {
    return () => {
      editorRef.current?.focus();
      fn();
      emitChange();
    };
  }

  const actions: ToolbarAction[] = [
    { label: "Bold", icon: Bold, run: withFocus(() => runCommand("bold")) },
    { label: "Italic", icon: Italic, run: withFocus(() => runCommand("italic")) },
    { label: "Underline", icon: Underline, run: withFocus(() => runCommand("underline")) },
    { label: "Bullet list", icon: List, run: withFocus(() => runCommand("insertUnorderedList")) },
    { label: "Numbered list", icon: ListOrdered, run: withFocus(() => runCommand("insertOrderedList")) },
    {
      label: "Link",
      icon: Link2,
      run: withFocus(() => {
        const url = window.prompt("Link URL");
        if (url) insertLink(url);
      }),
    },
    {
      label: "Image",
      icon: ImageIcon,
      run: withFocus(() => {
        const url = window.prompt("Image URL");
        if (url) insertImagePlaceholder(url);
      }),
    },
    { label: "Table", icon: TableIcon, run: withFocus(() => insertTable()) },
    { label: "Code block", icon: Code2, run: withFocus(() => insertCodeBlock()) },
    { label: "Undo", icon: Undo2, run: withFocus(() => runCommand("undo")) },
    { label: "Redo", icon: Redo2, run: withFocus(() => runCommand("redo")) },
  ];

  return (
    <FormField invalid={!!error} disabled={disabled} className={cn("gap-1.5", className)}>
      {label ? (
        <FormLabel id={labelId} htmlFor={controlId} required={required}>
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
        <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              aria-label={action.label}
              title={action.label}
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={action.run}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <action.icon className="size-3.5" />
            </button>
          ))}
        </div>

        <div
          ref={editorRef}
          id={controlId}
          role="textbox"
          aria-multiline="true"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={error || helperText ? `${controlId}-status` : undefined}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          data-placeholder={placeholder}
          style={{ minHeight }}
          className="max-w-none px-3 py-2.5 text-sm text-foreground outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_a]:text-primary [&_a]:underline [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_pre]:my-2 [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2.5 [&_pre]:font-mono [&_pre]:text-xs [&_table_td]:align-top [&_ul]:list-disc [&_ul]:pl-5"
        />
      </div>

      {error ? (
        <FormErrorMessage id={`${controlId}-status`}>{error}</FormErrorMessage>
      ) : helperText ? (
        <FormHint id={`${controlId}-status`}>{helperText}</FormHint>
      ) : null}
    </FormField>
  );
}

export { RichTextEditor };
