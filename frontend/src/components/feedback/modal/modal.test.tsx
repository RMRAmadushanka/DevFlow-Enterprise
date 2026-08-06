import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "./modal";
import { ConfirmModal } from "./confirm-modal";

describe("Modal", () => {
  it("renders title, description, and content when open", () => {
    render(
      <Modal open onOpenChange={vi.fn()} title="Edit project" description="Update details">
        <p>Body content</p>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit project")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("calls onOpenChange when Escape is pressed", async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="Closable">
        Content
      </Modal>
    );
    const user = userEvent.setup();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not close on Escape while loading", async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open loading onOpenChange={onOpenChange} title="Busy">
        Content
      </Modal>
    );
    const user = userEvent.setup();
    await user.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <Modal open onOpenChange={vi.fn()} title="Accessible modal" description="Helpful copy">
        Content
      </Modal>
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});

describe("ConfirmModal", () => {
  it("invokes onConfirm and closes", async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmModal
        open
        onOpenChange={onOpenChange}
        title="Delete Project?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={onConfirm}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("cancels without confirming", async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmModal open onOpenChange={onOpenChange} title="Delete?" onConfirm={onConfirm} />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
