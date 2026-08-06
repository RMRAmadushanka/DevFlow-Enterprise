import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { DropdownMenu } from "./index";

describe("DropdownMenu", () => {
  it("opens and runs an item action", async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu
        trigger={<button type="button">Actions</button>}
        label="Project Actions"
        items={[
          { id: "edit", label: "Edit", onSelect },
          { id: "delete", label: "Delete", destructive: true, onSelect: vi.fn() },
        ]}
      />
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByText("Project Actions")).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(onSelect).toHaveBeenCalled();
  });

  it("has no detectable accessibility violations when open", async () => {
    render(
      <DropdownMenu
        trigger={<button type="button">Open</button>}
        items={[{ id: "a", label: "Item A", onSelect: vi.fn() }]}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open" }));
    const menu = await screen.findByRole("menu");
    expect(await axe(menu)).toHaveNoViolations();
  }, 15000);
});
