import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { FolderKanban } from "lucide-react";

import { MetricCard } from "./metric-card";

describe("MetricCard", () => {
  it("renders title, value, and change", () => {
    render(
      <MetricCard
        title="Active Projects"
        value={24}
        change={12}
        changeLabel="Compared to last month"
        icon={<FolderKanban data-testid="metric-icon" />}
      />
    );

    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByText("Compared to last month")).toBeInTheDocument();
    expect(screen.getByTestId("metric-icon")).toBeInTheDocument();
  });

  it("applies variant data attribute", () => {
    const { container } = render(
      <MetricCard title="Errors" value={3} variant="danger" />
    );
    expect(container.querySelector('[data-slot="metric-card"]')).toHaveAttribute(
      "data-variant",
      "danger"
    );
  });

  it("shows loading skeletons", () => {
    const { container } = render(
      <MetricCard title="Active Projects" value={24} loading />
    );
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <MetricCard title="Active Projects" value={24} change={12} />
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
