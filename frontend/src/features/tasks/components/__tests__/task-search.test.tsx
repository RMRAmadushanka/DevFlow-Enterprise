import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useTaskStore } from "../../store/task.store";
import { TaskSearch } from "../task-search";

describe("TaskSearch", () => {
  beforeEach(() => {
    useTaskStore.getState().resetFilters();
  });

  it("updates the store search query", async () => {
    const user = userEvent.setup();
    render(<TaskSearch />);
    const input = screen.getByLabelText(/search tasks/i);
    await user.type(input, "rate");
    expect(useTaskStore.getState().filters.q.length).toBeGreaterThan(0);
  });
});
