import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProjectStore } from "../../store/project.store";
import { ProjectListView } from "../project-list-view";
import { sampleProject } from "./fixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/projects",
}));

vi.mock("../../hooks/use-projects", () => ({
  useProjects: () => ({
    data: { items: [sampleProject], total: 1 },
    isLoading: false,
    isError: false,
  }),
  useArchiveProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useToggleFavorite: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDuplicateProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("ProjectListView", () => {
  beforeEach(() => {
    useProjectStore.setState({ viewMode: "grid" });
    useProjectStore.getState().resetFilters();
  });

  it("renders list header and project cards", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ProjectListView />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByText(/manage all software projects/i)).toBeInTheDocument();
    expect(screen.getAllByText("API Gateway").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /create project/i })).toBeInTheDocument();
  });
});
