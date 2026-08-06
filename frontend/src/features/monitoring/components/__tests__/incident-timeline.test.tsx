import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IncidentTimeline } from "../incident-timeline";
import { sampleIncident } from "./fixtures";

describe("IncidentTimeline", () => {
  it("renders timeline events", () => {
    render(<IncidentTimeline events={sampleIncident.timeline} />);

    expect(screen.getByLabelText(/Incident timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Incident opened from alert/i)).toBeInTheDocument();
    expect(screen.getByText(/Investigating upstream timeout/i)).toBeInTheDocument();
  });
});
