import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MarkdownEditor } from "../markdown-editor";

describe("MarkdownEditor", () => {
  it("supports edit mode and toolbar inserts", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MarkdownEditor
        label="Document markdown"
        value="# Title"
        onValueChange={onChange}
      />
    );

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByDisplayValue("# Title")).toBeInTheDocument();

    const bold = screen.getByRole("button", { name: /bold/i });
    await user.click(bold);
    expect(onChange).toHaveBeenCalled();
  });
});
