import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { RadioGroupField } from "./radio-group-field";

const options = [
  { value: "free", label: "Free", description: "For individuals" },
  { value: "pro", label: "Pro", description: "For teams" },
  { value: "enterprise", label: "Enterprise", description: "For organizations" },
];

describe("RadioGroupField", () => {
  it("renders every option as a mutually exclusive radio", () => {
    render(<RadioGroupField label="Plan" options={options} />);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("selects an option and reports its value", async () => {
    const onValueChange = vi.fn();
    render(<RadioGroupField label="Plan" options={options} onValueChange={onValueChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("radio", { name: /Pro/ }));

    expect(onValueChange).toHaveBeenCalledWith("pro");
  });

  it("reflects the controlled value as the checked radio", () => {
    render(<RadioGroupField label="Plan" options={options} value="enterprise" />);
    expect(screen.getByRole("radio", { name: /Enterprise/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Free/ })).not.toBeChecked();
  });

  it("only allows a single selection at a time via keyboard arrow navigation", async () => {
    const onValueChange = vi.fn();
    render(<RadioGroupField label="Plan" options={options} defaultValue="free" onValueChange={onValueChange} />);
    const user = userEvent.setup();

    screen.getByRole("radio", { name: /Free/ }).focus();
    await user.keyboard("{ArrowDown}");

    expect(onValueChange).toHaveBeenCalledWith("pro");
  });

  it("renders a disabled option that cannot be selected", () => {
    const optionsWithDisabled = [...options, { value: "custom", label: "Custom", disabled: true }];
    render(<RadioGroupField label="Plan" options={optionsWithDisabled} />);
    expect(screen.getByRole("radio", { name: "Custom" })).toHaveAttribute("aria-disabled", "true");
  });

  it("supports a card-based orientation", () => {
    render(<RadioGroupField label="Plan" options={options} orientation="cards" />);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("surfaces an error message via FormGroup", () => {
    render(<RadioGroupField label="Plan" options={options} error="Choose a plan to continue" />);
    expect(screen.getByText("Choose a plan to continue")).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <RadioGroupField label="Plan" description="Choose the plan that fits your team" options={options} required />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
