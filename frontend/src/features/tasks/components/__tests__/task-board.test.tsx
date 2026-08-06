import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { TaskBoard } from "../task-board";
import { sampleTask } from "./fixtures";

vi.mock("../../hooks/use-tasks", () => ({
  useTaskBoard: () => ({
    data: [
      {
        status: "in_progress",
        label: "In progress",
        tasks: [sampleTask],
      },
      {
        status: "todo",
        label: "To do",
        tasks: [],
      },
    ],
    isLoading: false,
    isError: false,
    collapsedColumns: [],
    toggleColumnCollapsed: vi.fn(),
  }),
  useMoveTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
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

describe("TaskBoard", () => {
  it("renders columns and task cards", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TaskBoard />
      </QueryClientProvider>
    );

    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("API-101")).toBeInTheDocument();
  });
});
