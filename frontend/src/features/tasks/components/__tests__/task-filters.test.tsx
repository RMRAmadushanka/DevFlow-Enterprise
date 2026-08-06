import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useTaskStore } from "../../store/task.store";
import { TaskFilters } from "../task-filters";

describe("TaskFilters", () => {
  beforeEach(() => {
    useTaskStore.getState().resetFilters();
  });

  it("renders core filter controls", () => {
    render(<TaskFilters />);
    expect(screen.getAllByText(/^status$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^priority$/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /more filters/i })).toBeInTheDocument();
  });
});
