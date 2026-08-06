import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { TaskChecklist } from "../task-checklist";
import { sampleChecklist } from "./fixtures";

const mutateAsync = vi.fn().mockResolvedValue(undefined);

vi.mock("../../hooks/use-tasks", () => ({
  useUpdateChecklist: () => ({ mutateAsync, isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("TaskChecklist", () => {
  it("renders checklist items and progress", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TaskChecklist taskId="task_1" items={sampleChecklist} />
      </QueryClientProvider>
    );

    expect(screen.getByText("Design approach")).toBeInTheDocument();
    expect(screen.getByText("Add tests")).toBeInTheDocument();
  });

  it("adds a checklist item", async () => {
    const user = userEvent.setup();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TaskChecklist taskId="task_1" items={sampleChecklist} />
      </QueryClientProvider>
    );

    const input = screen.getByLabelText(/new checklist item/i);
    await user.type(input, "Ship it");
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(mutateAsync).toHaveBeenCalled();
  });
});
