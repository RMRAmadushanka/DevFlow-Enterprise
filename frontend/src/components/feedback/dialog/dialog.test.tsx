import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { QuickDialog } from "./dialog";

describe("QuickDialog", () => {
  it("renders title and fires the primary action", async () => {
    const onAction = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <QuickDialog
        open
        onOpenChange={onOpenChange}
        title="Quick tip"
        description="Useful information"
        action={{ label: "Got it", onClick: onAction }}
      />
    );
    const user = userEvent.setup();
    expect(screen.getByText("Quick tip")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Got it" }));
    expect(onAction).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <QuickDialog open onOpenChange={vi.fn()} title="Info" description="Details" />
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
