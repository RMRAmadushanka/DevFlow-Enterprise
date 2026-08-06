import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TeamActivityWidget } from "../team-activity-widget";
import { MOCK_ACTIVITY } from "../../constants/mock-data";

vi.mock("../../hooks/use-dashboard-metrics", () => ({
  useDashboardActivity: () => ({
    data: MOCK_ACTIVITY,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe("TeamActivityWidget", () => {
  it("renders recent team actions", () => {
    render(<TeamActivityWidget />);
    expect(screen.getByText(/deployed version 2\.1/i)).toBeInTheDocument();
    expect(screen.getByText(/completed Sprint task/i)).toBeInTheDocument();
  });
});
