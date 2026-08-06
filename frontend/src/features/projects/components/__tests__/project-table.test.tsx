import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ProjectTable } from "../project-table";
import { sampleProject } from "./fixtures";

vi.mock("../../hooks/use-projects", () => ({
  useToggleFavorite: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("ProjectTable", () => {
  it("renders project rows", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ProjectTable projects={[sampleProject]} />
      </QueryClientProvider>
    );

    expect(screen.getByText("API Gateway")).toBeInTheDocument();
    expect(screen.getByText("Avery Chen")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("shows empty state when there are no projects", () => {
    render(<ProjectTable projects={[]} />);
    expect(screen.getByText(/no projects/i)).toBeInTheDocument();
  });
});
