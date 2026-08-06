import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { TaskComments } from "../task-comments";
import { sampleComments } from "./fixtures";

vi.mock("../../hooks/use-tasks", () => ({
  useTaskComments: () => ({ data: sampleComments, isLoading: false }),
  useCreateComment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateComment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteComment: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("TaskComments", () => {
  it("renders comments", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TaskComments taskId="task_1" />
      </QueryClientProvider>
    );

    expect(screen.getByText("Avery Chen")).toBeInTheDocument();
    expect(screen.getByText(/looks good/i)).toBeInTheDocument();
  });
});
