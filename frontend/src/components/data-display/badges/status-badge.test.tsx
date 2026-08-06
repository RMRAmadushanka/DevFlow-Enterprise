import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("renders tone-aware status labels", () => {
    render(
      <StatusBadge tone="success" dot>
        Production
      </StatusBadge>
    );
    expect(screen.getByText("Production")).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <>
        <StatusBadge tone="success">Completed</StatusBadge>
        <StatusBadge tone="warning">Pending</StatusBadge>
        <StatusBadge tone="danger">Failed</StatusBadge>
      </>
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
