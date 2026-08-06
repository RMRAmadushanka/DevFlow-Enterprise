import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("renders the range summary", () => {
    render(<Pagination page={1} pageSize={20} total={500} onPageChange={vi.fn()} noun="projects" />);
    expect(screen.getByText("Showing 1-20 of 500 projects")).toBeInTheDocument();
  });

  it("calls onPageChange for next/previous", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={100} onPageChange={onPageChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("marks the current page", () => {
    render(<Pagination page={3} pageSize={10} total={100} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <Pagination page={1} pageSize={20} total={100} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />
    );
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
