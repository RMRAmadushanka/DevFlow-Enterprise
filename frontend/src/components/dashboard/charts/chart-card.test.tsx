import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { ChartCard } from "./chart-card";

describe("ChartCard", () => {
  it("renders title, description, children, and legend", () => {
    render(
      <ChartCard
        title="Deployments"
        description="Last 30 days"
        summary="Deployments increased this month"
        legend={<span>Legend</span>}
        exportSlot={<button type="button">Export</button>}
      >
        <div>Chart canvas</div>
      </ChartCard>
    );

    expect(screen.getByText("Deployments")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Chart canvas")).toBeInTheDocument();
    expect(screen.getByText("Legend")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
    expect(screen.getByLabelText("Deployments increased this month")).toBeInTheDocument();
  });

  it("shows loading chrome", () => {
    render(
      <ChartCard title="Deployments" summary="Loading chart" loading>
        <div>Chart</div>
      </ChartCard>
    );
    expect(screen.queryByText("Chart")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/loading deployments/i);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <ChartCard title="Deployments" summary="Summary text">
        <div>Chart</div>
      </ChartCard>
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
