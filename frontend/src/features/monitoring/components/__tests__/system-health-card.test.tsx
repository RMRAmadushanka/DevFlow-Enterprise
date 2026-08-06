import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SystemHealthCard } from "../system-health-card";
import { sampleSystem } from "./fixtures";

describe("SystemHealthCard", () => {
  it("shows overall health and key metrics", () => {
    render(<SystemHealthCard system={sampleSystem} />);

    expect(screen.getByText(/System health/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Degraded/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/99\.72%/).length).toBeGreaterThan(0);
  });
});
