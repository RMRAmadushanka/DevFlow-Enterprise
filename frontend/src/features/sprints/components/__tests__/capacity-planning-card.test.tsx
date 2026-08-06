import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CapacityPlanningCard } from "../capacity-planning-card";

describe("CapacityPlanningCard", () => {
  it("warns when allocated work exceeds capacity", () => {
    render(
      <CapacityPlanningCard
        members={[
          {
            userId: "1",
            name: "Avery Chen",
            capacityPoints: 12,
            allocatedPoints: 14,
            availability: 100,
          },
        ]}
        capacityPoints={40}
        allocatedPoints={48}
      />
    );

    expect(screen.getByText(/over capacity/i)).toBeInTheDocument();
    expect(screen.getByText("Avery Chen")).toBeInTheDocument();
  });
});
