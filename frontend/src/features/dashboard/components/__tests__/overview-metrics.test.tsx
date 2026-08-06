import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OverviewMetrics } from "../overview-metrics";
import { MOCK_METRICS } from "../../constants/mock-data";

vi.mock("../../hooks/use-dashboard-metrics", () => ({
  useDashboardMetrics: () => ({
    data: {
      metrics: MOCK_METRICS,
      systemHealth: [{ id: "api", name: "API", status: "healthy", detail: "ok" }],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe("OverviewMetrics", () => {
  it("renders KPI metric titles", () => {
    render(<OverviewMetrics />);
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("Open Tasks")).toBeInTheDocument();
    expect(screen.getByText("Deployment Success Rate")).toBeInTheDocument();
    expect(screen.getByText("System health")).toBeInTheDocument();
  });
});
