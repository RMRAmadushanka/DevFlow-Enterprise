import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricChart } from "../metric-chart";
import { sampleMetric } from "./fixtures";

describe("MetricChart", () => {
  it("renders chart card with metric title", () => {
    render(<MetricChart metric={sampleMetric} />);

    expect(screen.getByText("CPU Usage")).toBeInTheDocument();
    expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
  });
});
