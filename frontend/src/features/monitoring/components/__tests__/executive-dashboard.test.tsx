import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ExecutiveDashboard } from "../executive-dashboard";
import { sampleAnalytics } from "./fixtures";

vi.mock("../../hooks/use-monitoring", () => ({
  useAnalytics: () => ({
    data: sampleAnalytics,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe("ExecutiveDashboard", () => {
  it("renders executive metrics", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ExecutiveDashboard />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Executive overview/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Degraded/i).length).toBeGreaterThan(0);
  });
});
