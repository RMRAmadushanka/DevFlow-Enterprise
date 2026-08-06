"use client";

import * as React from "react";

import { RichTextEditor } from "@/components/forms/rich-text";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

export interface CommentEditorProps {
  value?: string;
  defaultValue?: string;
  onSubmit: (bodyHtml: string) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  label?: string;
  loading?: boolean;
  className?: string;
}

function CommentEditor({
  value,
  defaultValue = "",
  onSubmit,
  onCancel,
  submitLabel = "Comment",
  label = "Write a comment",
  loading,
  className,
}: CommentEditorProps) {
  const [body, setBody] = React.useState(value ?? defaultValue);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (value !== undefined) setBody(value);
  }, [value]);

  async function handleSubmit() {
    const trimmed = body.replace(/<[^>]+>/g, "").trim();
    if (!trimmed) return;
    setPending(true);
    try {
      await onSubmit(body);
      if (value === undefined) setBody("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className} data-slot="comment-editor">
      <RichTextEditor value={body} onValueChange={setBody} label={label} />
      <div className="mt-2 flex flex-wrap gap-2">
        <PermissionGuard permission="document.update">
          <Button
            type="button"
            size="sm"
            disabled={loading || pending}
            aria-busy={loading || pending}
            onClick={() => void handleSubmit()}
          >
            {submitLabel}
          </Button>
        </PermissionGuard>
        {onCancel ? (
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { CommentEditor };
