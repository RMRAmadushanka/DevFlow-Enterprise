import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Stepper } from "./stepper";

const steps = [
  { id: "1", title: "Organization" },
  { id: "2", title: "Team" },
  { id: "3", title: "Project" },
  { id: "4", title: "Complete" },
];

describe("Stepper", () => {
  it("marks the current step and completed predecessors", () => {
    render(<Stepper steps={steps} current={1} />);
    expect(screen.getByLabelText("Step 2: Team")).toHaveAttribute("aria-label", "Step 2: Team");
    expect(screen.getByText("Organization").closest("li")).toBeInTheDocument();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Team");
  });

  it("invokes onStepClick for completed steps", async () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} current={2} onStepClick={onStepClick} />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Step 1: Organization"));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<Stepper steps={steps} current={0} />);
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
