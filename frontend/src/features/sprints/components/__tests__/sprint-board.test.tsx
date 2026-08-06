import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SprintBoard } from "../sprint-board";

vi.mock("@/features/tasks", () => ({
  TaskBoard: ({ projectId }: { projectId?: string }) => (
    <div data-testid="task-board">Board for {projectId}</div>
  ),
}));

describe("SprintBoard", () => {
  it("reuses TaskBoard for the project", () => {
    render(<SprintBoard projectId="proj_api" />);
    expect(screen.getByTestId("task-board")).toHaveTextContent("proj_api");
  });
});
