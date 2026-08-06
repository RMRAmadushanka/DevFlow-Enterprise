import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EntityCard } from "../entity-card";
import type { Entity } from "../../types/entity.types";

const entity: Entity = {
  id: "1",
  name: "Sample entity",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("EntityCard (feature template)", () => {
  it("renders entity name and status", () => {
    render(<EntityCard entity={entity} />);
    expect(screen.getByText("Sample entity")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
