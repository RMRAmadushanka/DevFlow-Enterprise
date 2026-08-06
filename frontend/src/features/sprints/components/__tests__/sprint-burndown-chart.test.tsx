import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SprintBurndownChart } from "../sprint-burndown-chart";
import { sampleBurndown } from "./fixtures";

describe("SprintBurndownChart", () => {
  it("renders burndown chart card", () => {
    render(<SprintBurndownChart data={sampleBurndown} />);
    expect(screen.getAllByText(/burndown/i).length).toBeGreaterThan(0);
  });
});
