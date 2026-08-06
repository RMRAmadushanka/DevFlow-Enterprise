import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { CommandPalette } from "./command-palette";

const groups = [
  {
    id: "nav",
    heading: "Navigation",
    actions: [
      { id: "create", label: "Create Project", onSelect: vi.fn() },
      { id: "settings", label: "Open Settings", onSelect: vi.fn() },
    ],
  },
];

describe("CommandPalette", () => {
  it("renders groups when open and runs an action", async () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CommandPalette
        open
        onOpenChange={onOpenChange}
        enableShortcut={false}
        groups={[
          {
            id: "nav",
            heading: "Navigation",
            actions: [{ id: "create", label: "Create Project", onSelect }],
          },
        ]}
      />
    );
    const user = userEvent.setup();

    expect(screen.getByPlaceholderText("Search commands…")).toBeInTheDocument();
    await user.click(screen.getByText("Create Project"));
    expect(onSelect).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("filters items via search", async () => {
    render(
      <CommandPalette open onOpenChange={vi.fn()} enableShortcut={false} groups={groups} />
    );
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Search commands…"), "Settings");
    expect(screen.getByText("Open Settings")).toBeInTheDocument();
    expect(screen.queryByText("Create Project")).not.toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <CommandPalette open onOpenChange={vi.fn()} enableShortcut={false} groups={groups} />
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
