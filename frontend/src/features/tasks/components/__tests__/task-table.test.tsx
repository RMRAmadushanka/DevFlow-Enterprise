import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { TaskTable } from "../task-table";
import { sampleTask } from "./fixtures";

vi.mock("../../hooks/use-tasks", () => ({
  useToggleTaskFavorite: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useToggleTaskWatch: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDuplicateTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useArchiveTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("TaskTable", () => {
  it("renders task rows", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TaskTable tasks={[sampleTask]} />
      </QueryClientProvider>
    );

    expect(screen.getByText("API-101")).toBeInTheDocument();
    expect(screen.getByText("Rate limit gateway responses")).toBeInTheDocument();
    expect(screen.getByText("API Gateway")).toBeInTheDocument();
  });

  it("shows empty state when there are no tasks", () => {
    render(<TaskTable tasks={[]} />);
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
  });
});
