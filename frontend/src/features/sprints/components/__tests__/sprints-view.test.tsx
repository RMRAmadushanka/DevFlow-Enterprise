import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSprintStore } from "../../store/sprint.store";
import { SprintsView } from "../sprints-view";
import { sampleSprint } from "./fixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/sprints",
}));

vi.mock("../../hooks/use-sprints", () => ({
  useSprints: () => ({
    data: {
      items: [sampleSprint],
      total: 1,
      current: sampleSprint,
      upcoming: [],
      completed: [],
      archived: [],
    },
    isLoading: false,
    isError: false,
  }),
  useStartSprint: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCompleteSprint: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useArchiveSprint: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDuplicateSprint: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteSprint: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("SprintsView", () => {
  beforeEach(() => {
    useSprintStore.getState().resetFilters();
  });

  it("renders sprint list header and current sprint", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <SprintsView />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: "Sprints" })).toBeInTheDocument();
    expect(screen.getAllByText("Sprint 25").length).toBeGreaterThan(0);
  });
});
