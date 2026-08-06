import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { AdvancedFilter } from "./advanced-filter";
import type { FilterCondition, FilterFieldDefinition } from "./types";

const fields: FilterFieldDefinition[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "paused", label: "Paused" },
    ],
  },
  { id: "owner", label: "Owner", type: "text" },
];

describe("AdvancedFilter", () => {
  it("renders active filter chips", () => {
    const value: FilterCondition[] = [
      { id: "1", field: "status", operator: "eq", value: "active" },
    ];
    render(<AdvancedFilter fields={fields} value={value} onValueChange={vi.fn()} />);
    expect(screen.getByText(/Status is Active/)).toBeInTheDocument();
  });

  it("removes a chip when its remove button is clicked", async () => {
    const onValueChange = vi.fn();
    const value: FilterCondition[] = [
      { id: "1", field: "owner", operator: "contains", value: "Ada" },
    ];
    render(<AdvancedFilter fields={fields} value={value} onValueChange={onValueChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Remove filter" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("wires search through onSearchChange", async () => {
    const onSearchChange = vi.fn();
    render(
      <AdvancedFilter
        fields={fields}
        searchValue=""
        onSearchChange={onSearchChange}
        onValueChange={vi.fn()}
      />
    );
    const user = userEvent.setup();

    await user.type(screen.getByRole("searchbox"), "q");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <AdvancedFilter fields={fields} value={[]} onValueChange={vi.fn()} searchValue="" onSearchChange={vi.fn()} />
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
