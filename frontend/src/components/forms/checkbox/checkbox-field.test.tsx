import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { CheckboxField } from "./checkbox-field";
import { CheckboxGroupField } from "./checkbox-group-field";

describe("CheckboxField", () => {
  it("toggles via click and reports the next checked state", async () => {
    const onCheckedChange = vi.fn();
    render(<CheckboxField label="Accept terms" onCheckedChange={onCheckedChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: "Accept terms" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("supports uncontrolled usage via defaultChecked", () => {
    render(<CheckboxField label="Subscribe" defaultChecked />);
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toBeChecked();
  });

  it("renders the indeterminate visual state with a mixed aria value", () => {
    render(<CheckboxField label="Select all" indeterminate />);
    expect(screen.getByRole("checkbox", { name: "Select all" })).toHaveAttribute("aria-checked", "mixed");
  });

  it("renders a description tied via aria-describedby", () => {
    render(<CheckboxField label="Notifications" description="Get emailed about updates" />);
    const checkbox = screen.getByRole("checkbox", { name: "Notifications" });
    const description = screen.getByText("Get emailed about updates");
    expect(checkbox.getAttribute("aria-describedby")).toContain(description.id);
  });

  it("surfaces an error message and disables interaction when disabled", () => {
    render(<CheckboxField label="Accept terms" error="You must accept the terms" disabled />);
    expect(screen.getByText("You must accept the terms")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Accept terms" })).toHaveAttribute("aria-disabled", "true");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<CheckboxField label="Accept terms" description="Required to continue" required />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});

describe("CheckboxGroupField", () => {
  const options = [
    { value: "js", label: "JavaScript" },
    { value: "ts", label: "TypeScript" },
    { value: "go", label: "Go" },
  ];

  it("renders every option as its own checkbox under a shared legend", () => {
    render(<CheckboxGroupField label="Languages" options={options} />);
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "JavaScript" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "TypeScript" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Go" })).toBeInTheDocument();
  });

  it("reports the updated value array when an option is toggled", async () => {
    const onValueChange = vi.fn();
    render(<CheckboxGroupField label="Languages" options={options} value={["js"]} onValueChange={onValueChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: "TypeScript" }));

    expect(onValueChange).toHaveBeenCalledWith(["js", "ts"], expect.anything());
  });

  it("renders a 'Select all' row when showSelectAll is set", () => {
    render(<CheckboxGroupField label="Languages" options={options} showSelectAll />);
    expect(screen.getByRole("checkbox", { name: "Select all" })).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <CheckboxGroupField label="Languages" description="Pick every language you use" options={options} showSelectAll />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
