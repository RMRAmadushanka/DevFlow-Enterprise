import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { SelectField } from "./select-field";

const options = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

describe("SelectField", () => {
  it("shows the placeholder until a value is selected", () => {
    render(<SelectField label="Priority" options={options} placeholder="Choose a priority" />);
    expect(screen.getByRole("button", { name: "Priority" })).toHaveTextContent("Choose a priority");
  });

  it("shows the selected option's label when a value is provided", () => {
    render(<SelectField label="Priority" options={options} value="medium" />);
    expect(screen.getByRole("button", { name: "Priority" })).toHaveTextContent("Medium");
  });

  it("opens the option list and selects an option via click", async () => {
    const onValueChange = vi.fn();
    render(<SelectField label="Priority" options={options} onValueChange={onValueChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Priority" }));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("High"));

    expect(onValueChange).toHaveBeenCalledWith("high");
  });

  it("filters options as the user types in the search box", async () => {
    render(<SelectField label="Priority" options={options} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Priority" }));
    const search = await screen.findByPlaceholderText("Search…");
    await user.type(search, "Hi");

    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.queryByText("Low")).not.toBeInTheDocument();
  });

  it("clears the selection when clearable and the clear button is clicked", async () => {
    const onValueChange = vi.fn();
    render(<SelectField label="Priority" options={options} value="high" clearable onValueChange={onValueChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("surfaces an error message", () => {
    render(<SelectField label="Priority" options={options} error="Priority is required" />);
    expect(screen.getByText("Priority is required")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Priority" })).toHaveAttribute("aria-invalid", "true");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<SelectField label="Priority" options={options} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
