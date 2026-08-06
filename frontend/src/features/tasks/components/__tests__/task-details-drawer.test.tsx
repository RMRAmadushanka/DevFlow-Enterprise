import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { TaskDetailsDrawer } from "../task-details-drawer";
import { sampleTaskDetail } from "./fixtures";

vi.mock("../../hooks/use-tasks", () => ({
  useTask: () => ({ data: sampleTaskDetail, isLoading: false, isError: false }),
  useTaskComments: () => ({ data: [], isLoading: false }),
  useCreateComment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateComment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteComment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateChecklist: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUploadAttachment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRemoveAttachment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useToggleTaskWatch: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useToggleTaskFavorite: () => ({ mutateAsync: vi.fn(), isPending: false }),
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

describe("TaskDetailsDrawer", () => {
  it("renders task details when open", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TaskDetailsDrawer taskId="task_1" open onOpenChange={vi.fn()} />
      </QueryClientProvider>
    );

    expect(screen.getByText("Rate limit gateway responses")).toBeInTheDocument();
    expect(screen.getByText("API-101")).toBeInTheDocument();
  });
});
