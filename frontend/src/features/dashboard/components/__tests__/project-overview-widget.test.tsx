import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectOverviewWidget } from "../project-overview-widget";
import { MOCK_PROJECTS } from "../../constants/mock-data";

vi.mock("../../hooks/use-dashboard-metrics", () => ({
  useDashboardProjects: () => ({
    data: MOCK_PROJECTS,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../hooks/use-dashboard-preferences", () => ({
  useDashboardPreferences: () => ({
    projectViewMode: "table",
    setProjectViewMode: vi.fn(),
  }),
}));

describe("ProjectOverviewWidget", () => {
  it("renders project rows", () => {
    render(<ProjectOverviewWidget />);
    expect(screen.getByText("API Gateway")).toBeInTheDocument();
    expect(screen.getByText("Web Console")).toBeInTheDocument();
  });
});
