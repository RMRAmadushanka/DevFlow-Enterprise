import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { LoadingOverlay } from "./loading-overlay";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("exposes a polite status label", () => {
    render(<Spinner label="Loading projects" />);
    expect(screen.getByText("Loading projects")).toBeInTheDocument();
  });
});

describe("LoadingOverlay", () => {
  it("renders when visible", () => {
    render(
      <div className="relative">
        <LoadingOverlay visible label="Saving…" />
      </div>
    );
    expect(screen.getAllByText("Saving…").length).toBeGreaterThan(0);
  });

  it("does not render content when hidden", () => {
    render(
      <div className="relative">
        <LoadingOverlay visible={false} label="Saving…" />
      </div>
    );
    expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
  });

  it("has no detectable accessibility violations when visible", async () => {
    const { container } = render(
      <div className="relative h-40">
        <LoadingOverlay visible label="Loading" />
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
