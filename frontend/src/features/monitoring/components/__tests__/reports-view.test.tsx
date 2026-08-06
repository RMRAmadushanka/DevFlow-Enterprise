import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ReportsView } from "../reports-view";
import { sampleReport } from "./fixtures";

vi.mock("../../hooks/use-monitoring", () => ({
  useReports: () => ({
    data: [sampleReport],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateReport: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useExportReport: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("ReportsView", () => {
  it("renders report list", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ReportsView />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: "Reports" })).toBeInTheDocument();
    expect(screen.getByText(/Weekly engineering digest/i)).toBeInTheDocument();
  });
});
