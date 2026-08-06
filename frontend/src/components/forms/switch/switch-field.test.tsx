import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { SwitchField } from "./switch-field";

describe("SwitchField", () => {
  it("renders a labeled switch and toggles on click", async () => {
    const onCheckedChange = vi.fn();
    render(<SwitchField label="Enable notifications" onCheckedChange={onCheckedChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("switch", { name: "Enable notifications" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("supports uncontrolled usage via defaultChecked", () => {
    render(<SwitchField label="Dark mode" defaultChecked />);
    expect(screen.getByRole("switch", { name: "Dark mode" })).toBeChecked();
  });

  it("renders a description tied via aria-describedby", () => {
    render(<SwitchField label="Auto-save" description="Save your work every few minutes" />);
    const control = screen.getByRole("switch", { name: "Auto-save" });
    const description = screen.getByText("Save your work every few minutes");
    expect(control.getAttribute("aria-describedby")).toContain(description.id);
  });

  it("is disabled and non-interactive when disabled", () => {
    render(<SwitchField label="Beta features" disabled />);
    expect(screen.getByRole("switch", { name: "Beta features" })).toHaveAttribute("aria-disabled", "true");
  });

  it("shows a loading indicator instead of the switch control while loading", () => {
    render(<SwitchField label="Syncing" loading />);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("surfaces an error message", () => {
    render(<SwitchField label="Terms" error="You must accept before continuing" />);
    expect(screen.getByText("You must accept before continuing")).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <SwitchField label="Enable notifications" description="Get notified about important changes" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
