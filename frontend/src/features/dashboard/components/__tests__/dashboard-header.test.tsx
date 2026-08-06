import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { DashboardHeader } from "../dashboard-header";

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("../../hooks/use-dashboard-preferences", () => ({
  useExportDashboardReport: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}));

describe("DashboardHeader", () => {
  it("renders greeting and primary actions", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <DashboardHeader userName="Avery Chen" />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: /avery/i })).toBeInTheDocument();
    expect(screen.getByText(/here is your engineering overview/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create project/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /invite member/i })).toBeInTheDocument();
  });
});
