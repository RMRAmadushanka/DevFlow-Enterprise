import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReleaseTimeline } from "../release-timeline";
import { sampleRelease } from "./fixtures";

describe("ReleaseTimeline", () => {
  it("renders releases", () => {
    render(<ReleaseTimeline releases={[sampleRelease]} />);
    expect(screen.getByText("Gateway Reliability")).toBeInTheDocument();
    expect(screen.getByText(/v1\.4\.0/)).toBeInTheDocument();
  });

  it("shows empty state when there are no releases", () => {
    render(<ReleaseTimeline releases={[]} />);
    expect(screen.getByText(/no releases/i)).toBeInTheDocument();
  });
});
