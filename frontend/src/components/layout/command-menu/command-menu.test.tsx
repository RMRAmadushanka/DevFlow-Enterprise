import { LayoutDashboard, FolderKanban } from "lucide-react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useLayoutStore } from "@/store/layout-store";
import { CommandMenu } from "./command-menu";
import type { CommandGroupConfig } from "./types";

function buildGroups(overrides?: Partial<Record<string, unknown>>): CommandGroupConfig[] {
  return [
    {
      id: "navigate",
      heading: "Navigate",
      actions: [
        { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, onSelect: vi.fn(), ...overrides },
        { id: "projects", label: "Go to Projects", icon: FolderKanban, onSelect: vi.fn() },
      ],
    },
  ];
}

afterEach(() => {
  useLayoutStore.setState({ commandMenuOpen: false });
});

describe("CommandMenu", () => {
  it("is not rendered in the DOM while closed", () => {
    render(<CommandMenu groups={buildGroups()} />);
    expect(screen.queryByPlaceholderText("Type a command or search…")).not.toBeInTheDocument();
  });

  it("opens via the ⌘K / Ctrl+K keyboard shortcut", async () => {
    render(<CommandMenu groups={buildGroups()} />);
    const user = userEvent.setup();

    await user.keyboard("{Meta>}k{/Meta}");

    expect(await screen.findByPlaceholderText("Type a command or search…")).toBeInTheDocument();
  });

  it("renders group headings and actions when open", async () => {
    useLayoutStore.setState({ commandMenuOpen: true });
    render(<CommandMenu groups={buildGroups()} />);

    expect(await screen.findByText("Navigate")).toBeInTheDocument();
    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Go to Projects")).toBeInTheDocument();
  });

  it("runs the action and closes the menu when an item is selected", async () => {
    const onSelect = vi.fn();
    const groups = buildGroups();
    groups[0].actions[0].onSelect = onSelect;

    useLayoutStore.setState({ commandMenuOpen: true });
    render(<CommandMenu groups={groups} />);
    const user = userEvent.setup();

    const item = await screen.findByText("Go to Dashboard");
    await user.click(item);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(useLayoutStore.getState().commandMenuOpen).toBe(false);
  });

  it("filters actions as the user types", async () => {
    useLayoutStore.setState({ commandMenuOpen: true });
    render(<CommandMenu groups={buildGroups()} />);
    const user = userEvent.setup();

    const input = await screen.findByPlaceholderText("Type a command or search…");
    await user.type(input, "Dashboard");

    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Go to Projects")).not.toBeInTheDocument();
  });

  it("has no detectable accessibility violations while open", async () => {
    useLayoutStore.setState({ commandMenuOpen: true });
    const { container } = render(<CommandMenu groups={buildGroups()} />);
    await screen.findByText("Navigate");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
