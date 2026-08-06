import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders default copy for the no-data variant", () => {
    render(<EmptyState variant="no-data" />);
    expect(screen.getByText("No data yet")).toBeInTheDocument();
  });

  it("allows title/description/action overrides", () => {
    render(
      <EmptyState
        variant="no-results"
        title="No Projects Found"
        description="Create your first project"
        action={<button type="button">Create Project</button>}
      />
    );
    expect(screen.getByText("No Projects Found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Project" })).toBeInTheDocument();
  });

  it("uses role=alert for the error variant", () => {
    render(<EmptyState variant="error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<EmptyState variant="no-permission" />);
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
