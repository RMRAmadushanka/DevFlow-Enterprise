import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { DatePickerField } from "./date-picker-field";

describe("DatePickerField", () => {
  it("shows the placeholder until a date is selected", () => {
    render(<DatePickerField label="Due date" placeholder="Pick a date" />);
    expect(screen.getByRole("button", { name: "Due date" })).toHaveTextContent("Pick a date");
  });

  it("shows the formatted date when a value is provided", () => {
    const value = new Date(2024, 0, 15);
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    render(<DatePickerField label="Due date" value={value} formatDate={formatDate} />);
    expect(screen.getByRole("button", { name: "Due date" })).toHaveTextContent("2024-01-15");
  });

  it("opens a calendar popover when the trigger is clicked", async () => {
    render(<DatePickerField label="Due date" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Due date" }));

    expect(await screen.findByRole("grid")).toBeInTheDocument();
  });

  it("clears the selected date via the clear button", async () => {
    const onValueChange = vi.fn();
    render(<DatePickerField label="Due date" value={new Date(2024, 0, 15)} onValueChange={onValueChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Clear date" }));

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("surfaces an error message", () => {
    render(<DatePickerField label="Due date" error="Due date is required" />);
    expect(screen.getByText("Due date is required")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Due date" })).toHaveAttribute("aria-invalid", "true");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<DatePickerField label="Due date" value={new Date(2024, 0, 15)} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
