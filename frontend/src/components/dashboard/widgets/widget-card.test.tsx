import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { WidgetCard } from "./widget-card";

describe("WidgetCard", () => {
  it("renders header and children in default state", () => {
    render(
      <WidgetCard title="Overview" description="Last 30 days">
        <p>Widget body</p>
      </WidgetCard>
    );
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Widget body")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <WidgetCard title="Overview" loading>
        <p>Hidden</p>
      </WidgetCard>
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/loading overview/i);
  });

  it("shows empty state", () => {
    render(
      <WidgetCard title="Overview" empty>
        <p>Hidden</p>
      </WidgetCard>
    );
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("shows error with retry", async () => {
    const onRetry = vi.fn();
    render(
      <WidgetCard title="Overview" error onRetry={onRetry}>
        <p>Hidden</p>
      </WidgetCard>
    );
    expect(screen.getByText("Unable to load metrics")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <WidgetCard title="Overview" description="Helpful">
        Content
      </WidgetCard>
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
