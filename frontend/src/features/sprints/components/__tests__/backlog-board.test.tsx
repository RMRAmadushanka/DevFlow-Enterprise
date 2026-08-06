import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { BacklogBoard } from "../backlog-board";
import { sampleBacklog } from "./fixtures";

vi.mock("../../hooks/use-sprints", () => ({
  useReorderBacklog: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("BacklogBoard", () => {
  it("renders backlog items and story point totals", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <DndContext>
          <BacklogBoard projectId="proj_api" items={sampleBacklog} />
        </DndContext>
      </QueryClientProvider>
    );

    expect(screen.getByText("MOB-42")).toBeInTheDocument();
    expect(screen.getByText("API-110")).toBeInTheDocument();
  });
});
