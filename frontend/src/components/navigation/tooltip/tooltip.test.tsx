import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Tooltip } from "./index";

describe("Tooltip", () => {
  it("shows content on hover", async () => {
    render(
      <Tooltip content="More info" delay={0}>
        <button type="button">Hover me</button>
      </Tooltip>
    );
    const user = userEvent.setup();
    await user.hover(screen.getByRole("button", { name: "Hover me" }));
    // Base UI tooltip content is not exposed as role="tooltip" in this version —
    // assert via the content slot instead.
    expect(await screen.findByText("More info")).toBeInTheDocument();
    expect(document.querySelector('[data-slot="tooltip-content"]')).toBeTruthy();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <Tooltip content="Label" delay={0}>
        <button type="button">Icon</button>
      </Tooltip>
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
