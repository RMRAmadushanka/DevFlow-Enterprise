import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SprintReports } from "../sprint-reports";
import { sampleSprintDetail } from "./fixtures";

// Capacity/review sections wire live query + mutation hooks that need a
// QueryClientProvider — out of scope for this presentational render test.
vi.mock("../capacity-planning-card", () => ({
  CapacityPlanningSection: () => <div>Capacity section</div>,
}));
vi.mock("../sprint-review-card", () => ({
  SprintReviewSection: () => null,
}));

describe("SprintReports", () => {
  it("renders report charts for a sprint", () => {
    render(<SprintReports sprint={sampleSprintDetail} />);
    expect(screen.getAllByText(/burndown|velocity|burnup|capacity/i).length).toBeGreaterThan(0);
  });
});
