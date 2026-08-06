"use client";

import {
  MarkdownEditor as BaseMarkdownEditor,
  type MarkdownEditorProps as BaseMarkdownEditorProps,
} from "@/components/forms/markdown-editor";

export type FeatureMarkdownEditorProps = BaseMarkdownEditorProps;

/** Feature wrapper around the design-system MarkdownEditor. */
function MarkdownEditor(props: FeatureMarkdownEditorProps) {
  return <BaseMarkdownEditor {...props} />;
}

export { MarkdownEditor };
