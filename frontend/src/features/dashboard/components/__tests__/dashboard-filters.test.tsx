import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { DashboardFilters } from "../dashboard-filters";
import { useDashboardStore } from "../../store/dashboard.store";
import { MOCK_FILTER_OPTIONS } from "../../constants/mock-data";

vi.mock("../../hooks/use-dashboard-filters", () => ({
  useDashboardFilters: () => ({
    filters: useDashboardStore.getState().filters,
    options: MOCK_FILTER_OPTIONS,
    isLoadingOptions: false,
    setDateRange: useDashboardStore.getState().setDateRange,
    setFilter: useDashboardStore.getState().setFilter,
    setFilters: useDashboardStore.getState().setFilters,
  }),
}));

describe("DashboardFilters", () => {
  beforeEach(() => {
    useDashboardStore.setState({
      filters: {
        organizationId: "org_demo",
        teamId: null,
        projectId: null,
        environment: null,
        dateRange: { preset: "30d" },
      },
    });
  });

  it("renders filter controls and date presets", () => {
    render(<DashboardFilters />);
    expect(screen.getByRole("group", { name: /dashboard filters/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /date range/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /30 days/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("updates date range on preset click", async () => {
    render(<DashboardFilters />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /7 days/i }));
    expect(useDashboardStore.getState().filters.dateRange.preset).toBe("7d");
  });
});
