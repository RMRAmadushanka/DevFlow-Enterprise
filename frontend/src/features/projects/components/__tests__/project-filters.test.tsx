import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useProjectStore } from "../../store/project.store";
import { ProjectFilters } from "../project-filters";

describe("ProjectFilters", () => {
  beforeEach(() => {
    useProjectStore.getState().resetFilters();
  });

  it("renders status and visibility filters", () => {
    render(<ProjectFilters />);
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Visibility")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /more filters/i })).toBeInTheDocument();
  });
});
