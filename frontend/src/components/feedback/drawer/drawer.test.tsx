import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Drawer } from "./drawer";

describe("Drawer", () => {
  it("renders title and children when open", () => {
    render(
      <Drawer open onOpenChange={vi.fn()} title="Task details" description="Preview">
        <p>Drawer body</p>
      </Drawer>
    );
    expect(screen.getByText("Task details")).toBeInTheDocument();
    expect(screen.getByText("Drawer body")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange} title="Filters">
        Content
      </Drawer>
    );
    const user = userEvent.setup();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <Drawer open onOpenChange={vi.fn()} title="Accessible drawer">
        Content
      </Drawer>
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
