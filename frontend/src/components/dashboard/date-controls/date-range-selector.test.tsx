import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { DateRangeSelector } from "./date-range-selector";

describe("DateRangeSelector", () => {
  it("renders presets and reports selection", async () => {
    const onChange = vi.fn();
    render(
      <DateRangeSelector value={{ preset: "7d" }} onChange={onChange} />
    );

    expect(screen.getByRole("button", { name: "7 days" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await userEvent.setup().click(screen.getByRole("button", { name: "30 days" }));
    expect(onChange).toHaveBeenCalledWith({ preset: "30d" });
  });

  it("shows custom date inputs when custom is selected", () => {
    render(
      <DateRangeSelector
        value={{ preset: "custom", from: "2026-01-01", to: "2026-01-31" }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText("From date")).toHaveValue("2026-01-01");
    expect(screen.getByLabelText("To date")).toHaveValue("2026-01-31");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <DateRangeSelector value={{ preset: "today" }} onChange={vi.fn()} />
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
