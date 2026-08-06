import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectAnalytics } from "../project-analytics";
import { sampleAnalytics } from "./fixtures";

describe("ProjectAnalytics", () => {
  it("renders analytics widgets", () => {
    render(<ProjectAnalytics analytics={sampleAnalytics} />);
    expect(screen.getAllByText(/health score/i).length).toBeGreaterThan(0);
    expect(screen.getByText("86")).toBeInTheDocument();
  });

  it("shows empty state when there is no data", () => {
    render(
      <ProjectAnalytics
        analytics={{
          taskCompletionTrend: [],
          velocity: [],
          burndown: [],
          workload: [],
          issueDistribution: [],
          healthScore: 0,
        }}
      />
    );
    expect(screen.getByText(/no analytics data/i)).toBeInTheDocument();
  });
});
