import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { MonitoringDashboard } from "../monitoring-dashboard";
import { sampleOverview, sampleIncident } from "./fixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/monitoring",
}));

vi.mock("../../hooks/use-monitoring", () => ({
  useMonitoring: () => ({
    data: sampleOverview,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useIncidents: () => ({
    data: [sampleIncident],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useMetrics: () => ({
    data: sampleOverview.metrics,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useIncident: () => ({ data: sampleIncident, isLoading: false }),
  useAnalytics: () => ({
    data: {
      engineeringVelocity: 38,
      deploymentSuccessRate: 96.4,
      openIncidents: 2,
      projectSuccessRate: 88,
      teamUtilization: 74,
      platformHealth: "degraded",
      sprintCompletion: 81,
      repoActivity: 126,
      errorTrend: [{ label: "Now", value: 36 }],
      deploymentTrend: [{ label: "Now", value: 12 }],
      velocityTrend: [{ label: "Now", value: 34 }],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useServices: () => ({
    data: sampleOverview.services,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("MonitoringDashboard", () => {
  it("renders monitoring overview", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <MonitoringDashboard />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: "Monitoring" })).toBeInTheDocument();
    expect(screen.getAllByText(/System health/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Services/i).length).toBeGreaterThan(0);
  });
});
