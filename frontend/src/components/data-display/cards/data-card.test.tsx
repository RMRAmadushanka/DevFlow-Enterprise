import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { DataCard } from "./data-card";

describe("DataCard", () => {
  it("renders title and description", () => {
    render(<DataCard title="Platform" description="Core services" />);
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Core services")).toBeInTheDocument();
  });

  it("toggles selection for selectable cards", async () => {
    const onSelectedChange = vi.fn();
    render(
      <DataCard
        variant="selectable"
        title="Selectable project"
        selected={false}
        onSelectedChange={onSelectedChange}
      />
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: /Selectable project/i }));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it("fires onClick for interactive cards", async () => {
    const onClick = vi.fn();
    render(<DataCard variant="interactive" title="Open me" onClick={onClick} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Open me/i }));
    expect(onClick).toHaveBeenCalled();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <DataCard variant="selectable" title="Project A" description="Active" selected />
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
