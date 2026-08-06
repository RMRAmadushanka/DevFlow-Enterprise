import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { SprintPlanningBoard } from "../sprint-planning-board";
import { sampleBacklog } from "./fixtures";

const planningData = {
  backlog: sampleBacklog,
  sprintTasks: [] as typeof sampleBacklog,
  capacityPoints: 48,
  allocatedPoints: 0,
};

vi.mock("../../hooks/use-sprints", () => ({
  useSprintPlanning: () => ({
    data: planningData,
    isLoading: false,
  }),
  useMoveTasksToSprint: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("SprintPlanningBoard", () => {
  it("renders backlog and sprint columns", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <SprintPlanningBoard sprintId="sprint_25" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/backlog/i)).toBeInTheDocument();
    expect(screen.getByText("MOB-42")).toBeInTheDocument();
  });
});
