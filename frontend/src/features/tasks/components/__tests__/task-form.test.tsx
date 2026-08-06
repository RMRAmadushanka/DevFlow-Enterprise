import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { TaskForm } from "../task-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("../../hooks/use-tasks", () => ({
  useCreateTask: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useUpdateTask: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <TaskForm mode="create" />
    </QueryClientProvider>
  );
}

describe("TaskForm", () => {
  it("renders create fields", () => {
    renderForm();
    expect(screen.getByLabelText(/^title/i)).toBeInTheDocument();
    expect(screen.getByText(/project/i)).toBeInTheDocument();
    expect(screen.getByText(/priority/i)).toBeInTheDocument();
  });

  it("requires a title before submit", async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /create task/i }));
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
  });
});
