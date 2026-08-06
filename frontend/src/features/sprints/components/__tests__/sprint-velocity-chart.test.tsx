import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SprintVelocityChart } from "../sprint-velocity-chart";
import { sampleVelocity } from "./fixtures";

describe("SprintVelocityChart", () => {
  it("renders velocity chart card", () => {
    render(<SprintVelocityChart data={sampleVelocity} />);
    expect(screen.getAllByText(/velocity/i).length).toBeGreaterThan(0);
  });
});
