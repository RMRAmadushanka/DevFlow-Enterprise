import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DocumentEditor } from "../document-editor";

vi.mock("@tiptap/react", () => {
  const React = require("react") as typeof import("react");
  return {
    useEditor: ({
      onUpdate,
      content,
    }: {
      onUpdate?: (props: { editor: { getHTML: () => string } }) => void;
      content?: string;
    }) => {
      const chainApi = () => {
        const api = {
          focus: () => api,
          toggleBold: () => api,
          toggleItalic: () => api,
          toggleUnderline: () => api,
          toggleStrike: () => api,
          toggleBulletList: () => api,
          toggleOrderedList: () => api,
          toggleBlockquote: () => api,
          toggleCodeBlock: () => api,
          setHorizontalRule: () => api,
          undo: () => api,
          redo: () => api,
          toggleHeading: () => api,
          insertTable: () => api,
          setImage: () => api,
          extendMarkRange: () => api,
          setLink: () => api,
          unsetLink: () => api,
          run: () => true,
        };
        return api;
      };
      const editor = {
        isActive: () => false,
        can: () => ({
          undo: () => true,
          redo: () => true,
          chain: () => chainApi(),
        }),
        chain: () => chainApi(),
        getHTML: () => content || "<p>Hello</p>",
        getAttributes: () => ({}),
        commands: { setContent: vi.fn() },
        setEditable: vi.fn(),
      };
      React.useEffect(() => {
        onUpdate?.({ editor });
      }, []);
      return editor;
    },
    EditorContent: ({ editor }: { editor: { getHTML: () => string } }) => (
      <div data-testid="editor-content" role="textbox" aria-label="Document editor">
        {editor.getHTML()}
      </div>
    ),
  };
});

describe("DocumentEditor", () => {
  it("renders toolbar actions and editor surface", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DocumentEditor value="<p>Hello</p>" onChange={onChange} />);

    expect(screen.getByRole("textbox", { name: "Document editor" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Italic" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(screen.getByText(/word/i)).toBeInTheDocument();
  });
});
