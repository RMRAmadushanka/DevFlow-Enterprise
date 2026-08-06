import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { TaskBulkActions } from "../task-bulk-actions";

const mutateAsync = vi.fn().mockResolvedValue([]);

vi.mock("../../hooks/use-tasks", () => ({
  useBulkUpdateTasks: () => ({ mutateAsync, isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("TaskBulkActions", () => {
  it("renders when tasks are selected", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TaskBulkActions
          selectedIds={["task_1", "task_2"]}
          onClearSelection={vi.fn()}
          onArchive={vi.fn()}
          onDelete={vi.fn()}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
  });

  it("does not render when nothing is selected", () => {
    const { container } = render(
      <TaskBulkActions
        selectedIds={[]}
        onClearSelection={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("archives selected tasks", async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TaskBulkActions
          selectedIds={["task_1"]}
          onClearSelection={vi.fn()}
          onArchive={onArchive}
          onDelete={vi.fn()}
        />
      </QueryClientProvider>
    );

    await user.click(screen.getByRole("button", { name: /archive/i }));
    expect(onArchive).toHaveBeenCalledWith(["task_1"]);
  });
});
