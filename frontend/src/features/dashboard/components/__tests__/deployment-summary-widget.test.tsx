import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DeploymentSummaryWidget } from "../deployment-summary-widget";
import { MOCK_DEPLOYMENTS } from "../../constants/mock-data";

vi.mock("../../hooks/use-dashboard-metrics", () => ({
  useDashboardDeployments: () => ({
    data: MOCK_DEPLOYMENTS,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe("DeploymentSummaryWidget", () => {
  it("renders deployment rows with status", () => {
    render(<DeploymentSummaryWidget />);
    expect(screen.getByText("v2.1.0")).toBeInTheDocument();
    expect(screen.getAllByText(/success|failed|building|cancelled/i).length).toBeGreaterThan(0);
  });
});
