import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { ChartFilter } from "./chart-filter";

const filters = [
  {
    id: "env",
    label: "Environment",
    options: [
      { value: "prod", label: "Production" },
      { value: "staging", label: "Staging" },
    ],
  },
];

describe("ChartFilter", () => {
  it("renders filter labels and options", async () => {
    const onChange = vi.fn();
    render(<ChartFilter filters={filters} value={{ env: null }} onChange={onChange} />);

    expect(screen.getByText("Environment")).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Production" }));
    expect(onChange).toHaveBeenCalledWith({ env: "prod" });
  });

  it("shows option labels in the closed trigger, not raw values", () => {
    render(<ChartFilter filters={filters} value={{ env: "prod" }} onChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Production");
    expect(trigger).not.toHaveTextContent("prod");
  });

  it("shows All for a cleared filter instead of __all__", () => {
    render(<ChartFilter filters={filters} value={{ env: null }} onChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("All");
    expect(trigger).not.toHaveTextContent("__all__");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <ChartFilter filters={filters} value={{ env: "prod" }} onChange={vi.fn()} />
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
