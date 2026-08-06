import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SprintReports } from "../sprint-reports";
import { sampleSprintDetail } from "./fixtures";

describe("SprintReports", () => {
  it("renders report charts for a sprint", () => {
    render(<SprintReports sprint={sampleSprintDetail} />);
    expect(screen.getAllByText(/burndown|velocity|burnup|capacity/i).length).toBeGreaterThan(0);
  });
});
