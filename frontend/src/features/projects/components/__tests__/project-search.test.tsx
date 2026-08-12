import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useProjectStore } from "../../store/project.store";
import { ProjectSearch } from "../project-search";

describe("ProjectSearch", () => {
  beforeEach(() => {
    useProjectStore.getState().resetFilters();
  });

  it("updates the store search query after debounce", async () => {
    const user = userEvent.setup();
    render(<ProjectSearch />);
    const input = screen.getByLabelText(/search projects/i);
    await user.type(input, "gateway");
    await waitFor(
      () => {
        expect(useProjectStore.getState().filters.q).toBe("gateway");
      },
      { timeout: 1000 }
    );
  });
});
